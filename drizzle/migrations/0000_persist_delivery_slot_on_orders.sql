ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_slot text NOT NULL DEFAULT '10:00 - 10:30 AM';

CREATE OR REPLACE FUNCTION public.place_order_with_slot(items jsonb, selected_slot text)
RETURNS TABLE (order_number text, total numeric, wallet_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  placed record;
BEGIN
  IF selected_slot IS NULL OR selected_slot NOT IN (
    '10:00 - 10:30 AM',
    '12:00 - 12:30 PM',
    '03:00 - 03:30 PM'
  ) THEN
    RAISE EXCEPTION 'Please choose an available delivery slot';
  END IF;

  SELECT * INTO placed FROM public.place_order(items);

  UPDATE public.orders
  SET delivery_slot = selected_slot
  WHERE orders.order_number = placed.order_number
    AND orders.user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order could not be updated with the selected delivery slot';
  END IF;

  RETURN QUERY SELECT placed.order_number::text, placed.total::numeric, placed.wallet_balance::numeric;
END;
$fn$;

REVOKE ALL ON FUNCTION public.place_order_with_slot(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order_with_slot(jsonb, text) TO authenticated, service_role;