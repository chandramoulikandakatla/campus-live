CREATE SEQUENCE public.order_seq START 1024;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  brand text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  unit text,
  image_url text,
  stock_quantity integer NOT NULL DEFAULT 0,
  reorder_threshold integer NOT NULL DEFAULT 6,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO authenticated, anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable by everyone" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_name_idx ON public.products (lower(name));

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  student_id text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT 'Student',
  campus text NOT NULL DEFAULT 'Main Campus',
  wallet_balance numeric(10,2) NOT NULL DEFAULT 2000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'placed',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products,
  product_name text NOT NULL,
  sku text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  line_total numeric(10,2) NOT NULL
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $fn$;
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.profiles (id, student_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'student_id', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $fn$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.place_order(items jsonb)
RETURNS TABLE (order_number text, total numeric, wallet_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  uid uuid := auth.uid();
  it jsonb;
  prod public.products;
  qty integer;
  running numeric(10,2) := 0;
  new_order public.orders;
  num text;
  bal numeric(10,2);
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF items IS NULL OR jsonb_array_length(items) = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;

  num := 'CK' || lpad(((nextval('public.order_seq') % 100000))::text, 4, '0');
  INSERT INTO public.orders (order_number, user_id, status, total)
  VALUES (num, uid, 'placed', 0) RETURNING * INTO new_order;

  FOR it IN SELECT * FROM jsonb_array_elements(items) LOOP
    qty := (it->>'quantity')::int;
    IF qty IS NULL OR qty < 1 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    SELECT * INTO prod FROM public.products WHERE id = (it->>'product_id')::uuid FOR UPDATE;
    IF NOT FOUND OR NOT prod.is_active THEN RAISE EXCEPTION 'Product unavailable'; END IF;
    IF prod.stock_quantity < qty THEN
      RAISE EXCEPTION 'Only % left of %', prod.stock_quantity, prod.name;
    END IF;
    UPDATE public.products SET stock_quantity = stock_quantity - qty WHERE id = prod.id;
    INSERT INTO public.order_items (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
    VALUES (new_order.id, prod.id, prod.name, prod.sku, prod.price, qty, prod.price * qty);
    running := running + prod.price * qty;
  END LOOP;

  SELECT p.wallet_balance INTO bal FROM public.profiles p WHERE p.id = uid FOR UPDATE;
  IF bal IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF bal < running THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;

  UPDATE public.profiles SET wallet_balance = wallet_balance - running WHERE id = uid RETURNING profiles.wallet_balance INTO bal;
  UPDATE public.orders SET total = running WHERE id = new_order.id;

  RETURN QUERY SELECT num, running, bal;
END; $fn$;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO authenticated;

DO $seed$
DECLARE
  raw text := $list$
Chips|Snacks|1 pack|20|60
Bingo original style
Bingo mad angle
Lays
Kurkure
Too yummy
Cheetos
Haldirams nagpur halke fulke
Lays sizzling
Bingo tedhe medhe
Uncle chips
Veerabhadra Banana chips
Piknik classic tomato chips
Beyond snacks
Chheda's long masala
Balaji chips
Pringles original potato chips
Rusks & Wafers|Snacks|1 pack|30|90
Britannia toastea
Parel real elaichi rusk
Dukes waffy chocolate wafer
Dukes waffy choco wafer roll
Britannia treat rich cream strawberry
Britannia treat rich cream orange
Modern milk rusk
Modern sunbake rusk
Energy Bars|Snacks|1 bar|60|120
Yoga bar chocolate chunk nut
Rite bite max protein
Yoga bar dark chocolate and cranberry
Rite bite max protein daily choco berry bar
Nachos|Snacks|1 pack|40|110
Cornitos tomato Mexicana crisps
Doritos dinamita sizzling hot
Doritos cheese
Cornitos peri peri
Bingo mad angles pizza nachos
Doritos sweet chilli
Bingo mad angles cheese nachos
Cornitos tikka masala nachos
Cornitos cheese and herbs nachos
Cornitos sizzlin jalapeno
Bhujia & Mixtures|Snacks|200 g|30|120
Let's try onion bhujia
Haldirams nagpur aloo bhujia
Haldirams khatta meetha
Haldirams moong dal namkeen
Veerabhadra mixture namkeen
Haldirams mixture namkeen
Haldirams lite chivda namkeen
Haldirams Sev
Chheda's nylon Sev
Haldirams bhelpuri
Chheda's farsan mixture
Bikano bikaneri bhujia
Bikaji bhujia
Balaji ratlami sev
Balaji aloo sev
Chheda's ratlami sev bhujia
Chheda's farali potato falhari mixture
Parle chatkeen khatta
Haldirams soya sticks
Haldirams nagpur slated fried peanuts
Breakfast Cereals|Grocery|1 pack|120|450
Slurrp fram choco crunch
Kellogg's multigrain chocos
Kellogg's corn flakes
Kellogg's corn flakes with immuno nutrients
Kellogg's double chocolate fills
Kellogg's real almond honey
Tata soulful ragi bites
Hide & seek
Horlicks
Boost
Bournvita
Bur
nested
Chocolate|Confectionery|1 unit|20|180
Sinckers
Munch
Lote choco pie
Kitkat
Kinder joy
Dairy milk
Roasted dairy milk
Fruit & nut(diary milk)
5 star
dairy milk silk
Dairy milk bubble
Kisses
Gems
Twix
Galaxy
Milk bar
Bournville
Amul (dark chocolate)
Fuse
Chupa chup
Melody
Orbit
Biscuits|Snacks|1 pack|20|80
Hide & seek chocolate chips
Britannia good day pista badam
Britannia good day cashew
Dark fantasy
Mom's magic
Bournvita Biscuit
Hide & seek chocolate & almond
Hide & seek milano
Unbic Danish coconut
Unbic cashew badam
Open secret chocolate
Unbic choco chips
Unibic fruit and nut
Britannia tiger krunch choco cookies
Hide & seek coffee cookies
Bourbon dark fantasy
Jim jam
Malkist cheese
Dark fantasy vanilla sandwich
Bourbon cream
Orea
Dark fantasy choco cream
Hide & seek black Bourbon
Bounce choco biscuit
Milk bikis
Parle-G
Marie gold
Marie light
Nutrichocie
Little hearts
Krackjack
5050 maska chaska
Monaco
Malkist
Orea chocolate
Bread|Bakery|400 g|35|60
Milk bread
100% whole bread
Brown bread (Britannia)
Fabric Conditioner|Home Care|800 ml|90|260
Savlon
Rin ala
Softouch 2x french perfume
Comfort (morning fresh)
Softouch (ocean breeze)
Comfort (lily)
Vanish oxi
comfort(fragrance pearl)
Detergent Powder & Bars|Home Care|1 kg|60|320
Surf excel easy wash (powder, liquid, bar)
surf excel quick wash
Tide plus double powder (Powder, bar)
Surf excel strain eraser
Rin (powder, bars)
Ariel (Powder, liquid)
Ghadi (powder, bars)
Dishwashing Gels|Home Care|500 ml|60|180
Vim
Giffy
Pril
Disinfectants|Home Care|500 ml|90|280
Detol antiseptic
Detol original multi-use skin & surface
Dettol lime fresh
Savlon grem protection
Body Moisturizer|Personal Care|200 ml|110|420
Nivea body milk nourishing
Boroplus doodh kesar
Cetaphil daily
Cetaphil moisturizer
Vaseline gluta hya
Vaseline intensive care cocoa glow
Plum body lovin' vanilla
Joy honey & almond
Ponds triple vitamine
Joy pure aloe multi benefit
Joy cocoa rich intense
Vaseline daily brightening
Santoor whitening
Bathing Soaps|Personal Care|100 g|30|110
Dove cream
Santoor skin
Medimix ayurvedic
Flama black current
Himalaya neem & tumeric
Lux Natural glow
Santoor pureglo glycerine
Cetaphil
Pears soft & fresh
Himalaya cucumber & coconut
Jo lime sparking
Dettol original
Santoor skin softening sandal & almond
Cinthil
Lux Jasmine & vitamin E
Margo
Liril
Hamam
Mysore sandal
Hair Oil & Serum|Personal Care|200 ml|80|340
L'oreal pairs extraordinary
Bajaj drop almond hair oil
Parachute
Parachute advanced Aloe vera enriched
Bajaj coconut oil
Dabur amla hair oil
Vatika
Kesh king ayurvedic
Tresemme
Sesa
Oral Care|Personal Care|1 unit|45|240
Pepsodent G expert
Colgate strong teeth
Oral-B pro clean sensitive & gums toothbrush
Sensodyne deep clean sensitive
Sensodyne sensitive toothbrush
Closeup
Listerine cool mint mouthwash
Colgate viable white
Colgate sensitive soft bristles toothbrush
Dabur bed
Sensodyne rapid relief sensitive
Colgate zig zag brush
Colgate maxfresh
Colgate charcoal
Himalaya complete care herbal
Colgate maxfersh peppermint mouthfresh
Hand Wash|Personal Care|200 ml|60|150
Savlon deep clean grem
Detol sinkcare
Santoor mid hand wash
Dettol pH-balanced
Savlon herbal sensitive
Shampoo & Conditioner|Personal Care|340 ml|90|420
Tresemme keratin smooth
Meera strong & healthy
Medikar anti lice
L'oreal pairs
Meera hairfall care
Head & shoulders cool menthol
Plum coconut milk & peptide
Sunslik stunning black shine
Himalaya anti-hairfall
Dove
Indulekha bringa
Clinic plus
Meera herbal hair wash
Tresemme smooth & shine
Tresemme hair fall
Dove hair fall reduce
Nyle damage repair shampoo
Head shoulder anti dandruff
Mamaearth tea tree anti dandruff
Mamaearth hair growth & fall control
Meera anti dandruff
Feminine Care|Personal Care|1 pack|60|300
Sirona disposable period pants
Satyfree secure nights
Whisper choice stain
Whisper choice nights sanitary pads
Plush teen
Stayfree secure cottony soft
Whisper ultra night
Whisper ultra soft air
Sofy bodyfit
Sofy anti bacteria
Azah rash free
Nua ultra safe rash free
Sofy anti-bacteria overnight
Fruits|Fresh|1 kg|30|180
banana
apple
orange
grapes
dragen fruit
water melon
dates
guava
pomegranates
mango
Dry Fruits|Fresh|250 g|150|900
Almonds
Cashews
Walnuts
Pistachios
Raisins
apricots
figs
dates
prune
$list$;
  ln text;
  parts text[];
  cur_cat text;
  cur_sub text;
  cur_unit text;
  lo int;
  hi int;
  n int := 0;
  sku_v text;
  price_v numeric;
  slug_v text;
BEGIN
  FOR ln IN SELECT trim(x) FROM regexp_split_to_table(raw, E'\n') AS x LOOP
    IF ln = '' THEN CONTINUE; END IF;
    IF position('|' in ln) > 0 THEN
      parts := string_to_array(ln, '|');
      cur_cat := parts[1]; cur_sub := parts[2]; cur_unit := parts[3];
      lo := parts[4]::int; hi := parts[5]::int;
      CONTINUE;
    END IF;
    n := n + 1;
    sku_v := 'CK-' || lpad(n::text, 3, '0');
    price_v := lo + (abs(hashtext(sku_v)) % ((hi - lo) / 5 + 1)) * 5;
    slug_v := left(trim(both '-' from regexp_replace(lower(ln), '[^a-z0-9]+', '-', 'g')), 48);
    INSERT INTO public.products (sku, name, category, subcategory, brand, price, unit, image_url, stock_quantity)
    VALUES (
      sku_v, ln, cur_cat, cur_sub,
      initcap(split_part(ln, ' ', 1)),
      price_v, cur_unit,
      sku_v || '-' || slug_v || '.webp',
      (ARRAY[0,4,9,15,22,30,40,55])[1 + (abs(hashtext(sku_v || 'stk')) % 8)]
    );
  END LOOP;
  RAISE NOTICE 'seeded % products', n;
END $seed$;