import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen py-20 px-4">
      <SEOHead
        title="Privacy Policy"
        description="Read Inquo.Site's Privacy Policy. Learn how we collect, use, and protect your personal information across our AI tools platform."
        keywords="privacy policy, data protection, Inquo.site privacy, GDPR, user data"
        canonicalUrl="https://inquo.site/privacy"
      />
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="glass-card p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Introduction</h2>
            <p>
              InQuo.site ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our AI Tools Hub platform.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul>
              <li>Register for an account</li>
              <li>Use our AI tools</li>
              <li>Subscribe to our services</li>
              <li>Contact us for support</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Usage data and preferences</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>
              When you use our platform, we may automatically collect certain information about your device and usage:
            </p>
            <ul>
              <li>IP address and browser type</li>
              <li>Operating system</li>
              <li>Page views and navigation patterns</li>
              <li>Time and date of access</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process your transactions</li>
              <li>Improve our AI tools and user experience</li>
              <li>Send you updates and promotional materials (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal 
              information. However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We may use third-party services for:
            </p>
            <ul>
              <li>Payment processing</li>
              <li>Analytics and performance monitoring</li>
              <li>AI model providers</li>
            </ul>
            <p>
              These third parties have access to your information only to perform specific tasks on our behalf 
              and are obligated to protect your information.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>

            <h2>Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              You can control cookie preferences through your browser settings.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our services are not intended for users under the age of 13. We do not knowingly collect 
              personal information from children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: inquo4@gmail.com</li>
              <li>Phone: 8002551361</li>
              <li>Address: Purnea, Bihar, India</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
