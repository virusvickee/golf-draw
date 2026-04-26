import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";
import * as React from "react";

interface PayoutConfirmedEmailProps {
  amount: string;
  month: string;
}

export const PayoutConfirmedEmail = ({ amount, month }: PayoutConfirmedEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" }}>
        <Container style={{ margin: "0 auto", padding: "40px 20px", maxWidth: "600px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginBottom: "20px" }}>
            💰 Payment Sent!
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "24px", color: "#cbd5e1" }}>
            Great news! We have successfully processed your payout of <strong>{amount}</strong> for the {month} draw.
          </Text>
          
          <Section style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "8px", margin: "24px 0" }}>
            <Text style={{ margin: 0, color: "#cbd5e1", lineHeight: "24px" }}>
              Depending on your bank, it may take 3-5 business days for the funds to appear in your account. Thank you for being a valued member of Golf Draw and supporting our charity partners!
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
              style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}
            >
              View Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PayoutConfirmedEmail;
