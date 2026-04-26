import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";
import * as React from "react";

interface DrawResultsEmailProps {
  month: string;
  drawnNumbers: number[];
  userScores: number[];
  matchCount: number;
  isWinner: boolean;
  prizeAmount: number;
}

export const DrawResultsEmail = ({ month, drawnNumbers, userScores, matchCount, isWinner, prizeAmount }: DrawResultsEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif", color: "#f8fafc" }}>
        <Container style={{ margin: "0 auto", padding: "40px 20px", maxWidth: "600px" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981", marginBottom: "20px" }}>
            🎯 Draw Results — {month}
          </Text>
          
          <Section style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "8px", margin: "24px 0", textAlign: "center" }}>
            <Text style={{ fontSize: "16px", color: "#cbd5e1", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              The Drawn Numbers
            </Text>
            <div style={{ display: "inline-block" }}>
              {drawnNumbers.map((n, i) => (
                <span key={i} style={{ display: "inline-block", width: "40px", height: "40px", lineHeight: "40px", borderRadius: "50%", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", margin: "0 5px" }}>
                  {n}
                </span>
              ))}
            </div>
          </Section>

          <Section style={{ border: "1px solid #334155", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 8px 0", textTransform: "uppercase" }}>Your Snapshot</Text>
            <Text style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0", color: "#fff" }}>
              {userScores.join(" - ")}
            </Text>
            
            <Text style={{ fontSize: "16px", color: "#cbd5e1", margin: 0 }}>
              You matched <strong style={{ color: "#10b981" }}>{matchCount}</strong> out of 5 numbers!
            </Text>
          </Section>

          {isWinner ? (
            <Section style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "20px", borderRadius: "8px", marginBottom: "32px", textAlign: "center" }}>
              <Text style={{ fontSize: "20px", fontWeight: "bold", color: "#10b981", margin: "0 0 10px 0" }}>Congratulations!</Text>
              <Text style={{ fontSize: "16px", color: "#cbd5e1", margin: 0 }}>You won a share of the prize pool: <strong>£{prizeAmount.toFixed(2)}</strong></Text>
            </Section>
          ) : (
            <Text style={{ fontSize: "16px", color: "#cbd5e1", marginBottom: "32px", textAlign: "center" }}>
              Better luck next month! Keep logging those scores.
            </Text>
          )}

          <Section style={{ textAlign: "center" }}>
            <Button 
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/draws`}
              style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}
            >
              View Full Results
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DrawResultsEmail;
