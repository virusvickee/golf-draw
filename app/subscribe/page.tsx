import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubscribeClient from "./SubscribeClient";

export default async function SubscribePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if ((userData as any)?.subscription_status === 'active') {
      redirect('/dashboard');
    }
  }

  return <SubscribeClient />;
}
