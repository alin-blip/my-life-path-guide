
CREATE POLICY "Admins can read email send log" ON public.email_send_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read email send state" ON public.email_send_state FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read suppressed emails" ON public.suppressed_emails FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
