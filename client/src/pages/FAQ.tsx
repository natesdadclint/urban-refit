import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Send, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function FAQ() {
  const [contactForm, setContactForm] = useState({
    email: "",
    message: "",
  });
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(true);
  const [messageSent, setMessageSent] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Message Sent!", {
        description: data.message,
      });
      setContactForm({ email: "", message: "" });
      setMessageSent(true);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to send message. Please try again.",
      });
    },
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.email || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }

    contactMutation.mutate({
      email: contactForm.email,
      message: contactForm.message,
      subscribeToNewsletter,
    });
  };

  const faqCategories = [
    {
      title: "About Urban Refit",
      questions: [
        {
          q: "What is Urban Refit?",
          a: "Urban Refit is a curated secondhand men's fashion marketplace. We personally source premium pre-owned clothing from local thrift stores, carefully inspect each item for quality, and offer them at fair prices. Our mission is to make sustainable fashion accessible while supporting our community partners."
        },
        {
          q: "How do you source your clothing?",
          a: "Our curator personally visits brick-and-mortar thrift stores to hand-select quality garments. We look for premium brands, excellent condition items, and timeless styles. Each piece is inspected, cleaned, and photographed before being listed on our platform."
        },
        {
          q: "Why should I buy secondhand clothing?",
          a: "Buying secondhand reduces textile waste, lowers your carbon footprint, and often gets you higher-quality garments at lower prices. The fashion industry is one of the world's largest polluters—by choosing pre-loved clothing, you're making a positive environmental impact while still looking great."
        },
        {
          q: "Is Urban Refit only for men's clothing?",
          a: "Yes, Urban Refit specializes exclusively in men's fashion. This allows us to curate a focused, high-quality selection of shirts, pants, jackets, shoes, caps, and accessories specifically for men."
        }
      ]
    },
    {
      title: "Product Quality & Condition",
      questions: [
        {
          q: "How do you rate the condition of items?",
          a: "We use a four-tier condition rating system: 'Like New' (appears unworn, no visible wear), 'Excellent' (minimal signs of wear, looks nearly new), 'Good' (light wear consistent with gentle use, fully functional), and 'Fair' (visible wear but still presentable and wearable). Each listing includes detailed photos and honest descriptions."
        },
        {
          q: "Are the clothes cleaned before shipping?",
          a: "Yes, all garments are professionally cleaned and inspected before being listed. However, as pre-owned items, some may retain subtle characteristics from previous ownership. We always disclose any notable details in the product description."
        },
        {
          q: "How accurate are the product photos?",
          a: "We photograph each item from multiple angles to show its true condition. Our dual-image display shows two different viewpoints of every garment. While we strive for accuracy, slight color variations may occur due to lighting or monitor differences."
        },
        {
          q: "What if an item doesn't match the description?",
          a: "If you receive an item that significantly differs from its description or photos, contact us within 14 days at help@urbanrefit.store. We'll review your case and offer a refund if the item was misrepresented. See our Refund Policy for full details."
        }
      ]
    },
    {
      title: "Thrift Store Partnerships",
      questions: [
        {
          q: "How does the thrift store partnership work?",
          a: "We partner with local thrift stores to source our inventory. When we sell a garment that came from a partner store, that store receives 10% of the sale price. This creates a sustainable cycle that benefits both the thrift stores and our customers."
        },
        {
          q: "Which thrift stores do you partner with?",
          a: "We work with various local thrift stores in our community. You can see which store each garment came from on the product detail page. Visit our Partners page to learn more about our community partnerships."
        },
        {
          q: "Can my thrift store become a partner?",
          a: "We're always looking to expand our network of thrift store partners. If you operate a thrift store and are interested in partnering with Urban Refit, please contact us at help@urbanrefit.store with details about your store."
        },
        {
          q: "How are thrift store payouts calculated?",
          a: "Each partner thrift store receives exactly 10% of the sale price for every garment we sell that originated from their store. Payouts are tracked automatically and processed regularly. This ensures our partners benefit directly from every successful sale."
        }
      ]
    },
    {
      title: "Pricing & Payment",
      questions: [
        {
          q: "How do you determine prices?",
          a: "Our prices are based on the original purchase cost from the thrift store, plus a markup that covers our curation, cleaning, photography, and operational costs. We aim to offer fair prices that reflect the quality and brand value of each item while remaining accessible."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit and debit cards through our secure Stripe payment system. This includes Visa, Mastercard, American Express, and other popular payment methods. All transactions are encrypted and secure."
        },
        {
          q: "Do you offer discounts?",
          a: "Yes! We offer tiered discounts based on order quantity: 10% off orders of 3+ items, 15% off 5+ items, 20% off 7+ items, and 25% off 10+ items. Members can also use loyalty tokens and spend limit credits for additional savings."
        },
        {
          q: "Are prices negotiable?",
          a: "Our prices are fixed and reflect fair market value for the quality and brand of each item. However, our tiered discount system and loyalty program offer significant savings for regular customers."
        }
      ]
    },
    {
      title: "Loyalty Program & Tokens",
      questions: [
        {
          q: "What is the Urban Refit loyalty program?",
          a: "Our loyalty program rewards customers for sustainable shopping. You earn tokens when you return garments through our courier return system, and you can redeem tokens for discounts on future purchases or donate them to charity partners."
        },
        {
          q: "How do I earn tokens?",
          a: "You earn tokens by returning garments you've purchased from our Courier Return system. When your returned item is resold, you receive tokens worth 25% of the resale value. You also earn bonus tokens on bulk purchases (3+ items)."
        },
        {
          q: "What can I do with my tokens?",
          a: "Tokens can be converted to spend limit credit (1 token = NZ$0.50) to use on future orders of 3+ items, or you can donate your tokens to one of our charity partners. The choice is yours—save money or give back to the community."
        },
        {
          q: "Do tokens expire?",
          a: "Tokens do not expire as long as your account remains active. However, if you request a refund on an order where you earned bonus tokens, those tokens will be deducted from your balance."
        },
        {
          q: "What is spend limit credit?",
          a: "Spend limit credit is the dollar value you've converted from tokens. It can be applied to orders of 3 or more items. Your available spend limit is shown in your profile dashboard."
        }
      ]
    },
    {
      title: "Courier Returns & Circular Fashion",
      questions: [
        {
          q: "What is the Courier Return system?",
          a: "Our Courier Return system allows you to send back garments you've purchased from Urban Refit for another cycle of selling. Instead of letting clothes sit unused in your closet, you can return them to us, earn tokens when they resell, and help reduce textile waste."
        },
        {
          q: "How do I return a garment for resale?",
          a: "Log into your account, go to 'Return Garments' from the user menu, and submit a return request. Describe the item's current condition and we'll review your request. If approved, we'll provide shipping instructions."
        },
        {
          q: "What condition must returned items be in?",
          a: "Returned items should be clean, wearable, and in similar or better condition than when you received them. Items with significant new damage, stains, or excessive wear may not be accepted for resale."
        },
        {
          q: "How much will I earn from a returned item?",
          a: "When your returned item sells, you'll receive tokens worth 25% of the resale price. The exact amount depends on the condition and resale value of the garment."
        },
        {
          q: "What is circular fashion?",
          a: "Circular fashion is a sustainable approach where garments are kept in use for as long as possible through resale, repair, and recycling. Urban Refit's model—sourcing from thrift stores, reselling, and accepting returns for another cycle—is a practical implementation of circular fashion principles."
        }
      ]
    },
    {
      title: "Charity Donations",
      questions: [
        {
          q: "Can I donate my tokens to charity?",
          a: "Yes! Instead of converting tokens to spend limit credit, you can donate them to one of our charity partners. Visit the 'Donate Tokens' page to see available charities and make a donation."
        },
        {
          q: "Which charities do you support?",
          a: "We partner with various charitable organizations focused on sustainability, community support, and social causes. Visit our Charities page to see the current list of partner organizations and their missions."
        },
        {
          q: "How are charity donations processed?",
          a: "When you donate tokens, we convert them to their dollar equivalent and include them in our regular charitable giving. You'll receive confirmation of your donation, and the receiving charity is notified of the contribution."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      questions: [
        {
          q: "Where do you ship to?",
          a: "We currently ship to addresses within New Zealand. We are working on expanding our shipping options to other countries in the future."
        },
        {
          q: "How long does shipping take?",
          a: "Standard shipping typically takes 5-7 business days. Delivery times may vary based on your location and carrier conditions. You'll receive tracking information once your order ships."
        },
        {
          q: "How much does shipping cost?",
          a: "Standard shipping is NZ$9.99. Orders over NZ$50 qualify for free shipping. Courier return shipping is always free with a prepaid label included."
        },
        {
          q: "Can I track my order?",
          a: "Yes, once your order ships, you'll receive an email with tracking information. You can also view your order status and tracking details in your account under 'My Orders'."
        }
      ]
    },
    {
      title: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "We accept returns within 14 days of delivery for items that are significantly not as described, have undisclosed damage, or if you received the wrong item. Due to the nature of secondhand items, we cannot accept returns for change of mind or fit issues. See our full Refund Policy for details."
        },
        {
          q: "How do I request a refund?",
          a: "Email help@urbanrefit.store within 14 days of delivery with your order number, a description of the issue, and clear photos showing the problem. We'll review your request within 2-3 business days."
        },
        {
          q: "Do you offer exchanges?",
          a: "Due to the unique nature of secondhand items, we don't offer direct exchanges. If you're eligible for a refund, you can return the item and place a new order for a different piece."
        },
        {
          q: "How long do refunds take to process?",
          a: "Once we receive and inspect your returned item, refunds are processed within 5-10 business days. The refund will be issued to your original payment method."
        }
      ]
    },
    {
      title: "Account & Privacy",
      questions: [
        {
          q: "Do I need an account to shop?",
          a: "You can browse our catalog without an account, but you'll need to create one to make purchases, track orders, and participate in our loyalty program. Account creation is free and takes just a moment."
        },
        {
          q: "How is my personal information protected?",
          a: "We take privacy seriously. Your personal data is encrypted and stored securely. We never sell your information to third parties. See our Privacy Policy for complete details on how we handle your data."
        },
        {
          q: "How do I delete my account?",
          a: "To delete your account, please contact us at help@urbanrefit.store. Note that deleting your account will forfeit any unused tokens or spend limit credit."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about Urban Refit, our secondhand fashion marketplace, and how we're making sustainable style accessible."
          className="max-w-4xl"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </PageHeader>

        {/* FAQ Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <SectionHeader title={category.title} className="pb-2 border-b border-border" />
                <Accordion type="single" collapsible className="space-y-2 mt-6">
                  {category.questions.map((item, questionIndex) => (
                    <AccordionItem 
                      key={questionIndex} 
                      value={`${categoryIndex}-${questionIndex}`}
                      className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact CTA with Email Collection */}
          <div className="mt-16 p-8 bg-muted/50 rounded-lg">
            <SectionHeader 
              title="Still have questions?" 
              subtitle="We're here to help. Send us a message and we'll get back to you."
              level="h3" 
              centered 
              className="mb-6"
            />
            
            {messageSent ? (
              <div className="max-w-md mx-auto text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">Message Sent!</h4>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setMessageSent(false)}
                  className="mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
            <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
              
              <Textarea
                placeholder="How can we help you?"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
              />
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="subscribeNewsletter"
                  checked={subscribeToNewsletter}
                  onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="subscribeNewsletter" className="text-sm text-muted-foreground cursor-pointer">
                  Keep me updated with news and offers
                </label>
              </div>
              
              <Button type="submit" className="w-full gap-2" disabled={contactMutation.isPending}>
                {contactMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Or email us directly at{" "}
                <a href="mailto:help@urbanrefit.store" className="underline hover:text-primary">
                  help@urbanrefit.store
                </a>
              </p>
            </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
