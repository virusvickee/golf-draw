import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";
import * as React from "react";

interface SubEmailProps {
  plan: string;
  amount: string;
  nextRenewal: string;
}

export const SubscriptionConfirmedEmail = ({ plan, amount, nextRenewal }: SubEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" }}>
        <Container style={{ margin: "0 auto", padding: "40px 20px", maxWidth: "600px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginBottom: "20px" }}>
            Subscription Confirmed ✅
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "24px", color: "#cbd5e1" }}>
            Your Golf Draw {plan} subscription is now active!
          </Text>
          
          <Section style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <Text style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Plan: <strong>{plan.toUpperCase()}</strong></Text>
            <Text style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Amount: <strong>{amount}</strong></Text>
            <Text style={{ margin: 0, color: "#cbd5e1" }}>Next Renewal: <strong>{nextRenewal}</strong></Text>
          </Section>

          <Text style={{ fontSize: "16px", color: "#cbd5e1", marginBottom: "24px" }}>
            You are now eligible to enter this month's prize draw. Make sure your 5 scores are logged!
          </Text>

          <Section style={{ textAlign: "center" }}>
            <Button 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scores`}
              style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}
            >
              Enter Your Scores
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionConfirmedEmail;
