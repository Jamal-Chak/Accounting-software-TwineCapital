import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components'

interface WelcomeEmailProps {
    userName: string
    companyName: string
    loginUrl?: string
}

export function WelcomeEmail({
    userName,
    companyName,
    loginUrl = 'http://localhost:3000/login',
}: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to TwineCapital - Your Intelligent Accounting Platform</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome to TwineCapital! 🎉</Heading>

                    <Text style={text}>Hi {userName},</Text>

                    <Text style={text}>
                        Thank you for joining TwineCapital! We're excited to help you manage
                        your accounting with intelligent automation and AI-powered insights.
                    </Text>

                    <Text style={text}>
                        Your company <strong>{companyName}</strong> is all set up and ready to go.
                    </Text>

                    <Section style={features}>
                        <Text style={featureTitle}>What you can do:</Text>
                        <Text style={feature}>✓ Create and send professional invoices</Text>
                        <Text style={feature}>✓ Track expenses and receipts</Text>
                        <Text style={feature}>✓ Manage clients and payments</Text>
                        <Text style={feature}>✓ Get AI-powered financial insights</Text>
                        <Text style={feature}>✓ Generate financial reports</Text>
                    </Section>

                    <Section style={buttonContainer}>
                        <Button style={button} href={loginUrl}>
                            Get Started
                        </Button>
                    </Section>

                    <Text style={footer}>
                        If you have any questions, feel free to reach out to our support team.
                    </Text>

                    <Text style={footer}>
                        Happy accounting!<br />
                        The TwineCapital Team
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
}

const h1 = {
    color: '#2563eb',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0 40px',
}

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 40px',
    margin: '16px 0',
}

const features = {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    margin: '24px 40px',
    padding: '24px',
}

const featureTitle = {
    color: '#333',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
}

const feature = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '28px',
    margin: '4px 0',
}

const buttonContainer = {
    padding: '24px 40px',
}

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
}

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '24px',
    padding: '0 40px',
    margin: '16px 0',
}

export default WelcomeEmail
