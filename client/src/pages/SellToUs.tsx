import { useState, useRef, useEffect } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, CheckCircle, Coins, Recycle, Clock, ArrowRight, ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function SellToUs() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    brand: "",
    itemType: "" as "tops" | "bottoms" | "outerwear" | "shoes" | "accessories" | "",
    itemName: "",
    size: "",
    condition: "" as "like_new" | "excellent" | "good" | "fair" | "",
    description: "",
    originalPrice: "",
    requestedTokens: "",
  });

  // Auto-fill form when user data loads (fixes race condition for logged-in users)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const submitMutation = trpc.sell.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setSubmissionId(data.id);
      toast.success("Your item has been submitted for review");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit item");
      setIsSubmitting(false);
    },
  });

  const uploadMutation = trpc.sell.uploadImage.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const { url } = await uploadMutation.mutateAsync({
            base64,
            filename: file.name,
            mimeType: file.type,
          });
          setImages((prev) => [...prev, url]);
        } catch {
          toast.error("Failed to upload image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemType || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    submitMutation.mutate({
      ...formData,
      itemType: formData.itemType as "tops" | "bottoms" | "outerwear" | "shoes" | "accessories",
      condition: formData.condition as "like_new" | "excellent" | "good" | "fair",
      requestedTokens: formData.requestedTokens ? parseInt(formData.requestedTokens) : undefined,
      image1Url: images[0] || undefined,
      image2Url: images[1] || undefined,
      image3Url: images[2] || undefined,
      image4Url: images[3] || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Submission Received</h2>
            <p className="text-muted-foreground mb-8">
              Thank you for contributing to the circular economy. Our team will review your item and get back to you within 2-3 business days.
              {submissionId && (
                <span className="block mt-2 font-medium text-foreground">
                  Reference Number: #{submissionId}
                </span>
              )}
            </p>
            <div className="bg-neutral-100 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Our team reviews your submission and assesses the item's condition and value.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>We'll send you a <strong>token offer</strong> based on our assessment. You can accept, counter, or decline.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Once agreed, we'll send you a prepaid shipping label to send us the item.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                  <span>After verification, tokens are added to your account. Use them to shop or donate to charity!</span>
                </li>
              </ol>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="outline" size="lg" className="gap-2" onClick={() => { setSubmitted(false); setImages([]); setFormData({ ...formData, brand: "", itemType: "", itemName: "", size: "", condition: "", description: "", originalPrice: "", requestedTokens: "" }); }}>
                Submit Another Item
              </Button>
              {user && (
                <Button asChild size="lg" className="gap-2">
                  <Link href="/my-submissions">View My Submissions</Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a href="/shop">Continue Shopping</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={<>Trade Your Clothes.<br />Earn Tokens. Keep It Circular.</>}
        subtitle="Turn your quality menswear into Urban Refit tokens. Use them to refresh your wardrobe or donate directly to our partner charities. No cash payouts — just a closed-loop ecosystem that keeps fashion sustainable."
      >
        <PageBreadcrumb className="mb-6 [&_*]:text-neutral-400 [&_[aria-current]]:text-white" segments={[{ label: "Sell to Us" }]} />
      </PageHeader>

      {/* How It Works */}
      <section className="py-12 bg-neutral-50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Submit</h3>
              <p className="text-sm text-muted-foreground">Fill out the form with your item details and photos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Review</h3>
              <p className="text-sm text-muted-foreground">We review and make you a token offer within 2-3 days</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Ship</h3>
              <p className="text-sm text-muted-foreground">Accept the offer and send us your item with free shipping</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Earn Tokens</h3>
              <p className="text-sm text-muted-foreground">Tokens added to your account — shop or donate!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Value Explainer */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <SectionHeader title="What Are Urban Refit Tokens?" level="h3" />
                  <p className="text-muted-foreground mb-4">
                    Tokens are our circular currency. <strong>1 token = $1.00 NZD</strong> in store credit. 
                    Unlike cash, tokens keep value circulating within our sustainable ecosystem.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <Card className="bg-white/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Shop New Styles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Use your tokens to buy any item from our curated collection.</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Donate to Charity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Convert your tokens into a cash donation to our partner charities.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Submit Your Item" subtitle="Fill in the details below to get a token offer for your pre-loved menswear." centered />

            <form onSubmit={handleSubmit} className="space-y-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Contact Info</CardTitle>
                  <CardDescription>So we can get in touch about your submission.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                  <CardDescription>Tell us about the item you want to trade.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input id="brand" placeholder="e.g. Levi's, Carhartt, Nike" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemName">Item Name / Style</Label>
                      <Input id="itemName" placeholder="e.g. 501 Original Fit Jeans" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="itemType">Item Type</Label>
                      <Select value={formData.itemType} onValueChange={(value) => setFormData({ ...formData, itemType: value as any })} required>
                        <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tops">Tops</SelectItem>
                          <SelectItem value="bottoms">Bottoms</SelectItem>
                          <SelectItem value="outerwear">Outerwear</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input id="size" placeholder="e.g. Medium, 32x32, US 10" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value as any })} required>
                        <SelectTrigger><SelectValue placeholder="Select condition..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="like_new">Like New</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Any additional details, flaws, or features to note?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                      <Input id="originalPrice" type="number" placeholder="e.g. 150" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requestedTokens">Requested Tokens (Optional)</Label>
                      <Input id="requestedTokens" type="number" placeholder="e.g. 75 (1 token = $1.00)" value={formData.requestedTokens} onChange={(e) => setFormData({ ...formData, requestedTokens: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Photos</CardTitle>
                  <CardDescription>Add up to 4 clear photos of your item. Max 5MB each.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {images.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={src} alt={`Upload preview ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {images.length < 4 && (
                      <div 
                        className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Add Image</span>
                      </div>
                    )}
                  </div>
                  <Input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleImageUpload}
                  />
                </CardContent>
              </Card>

              <div className="text-center">
                <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting || uploadMutation.isPending}>
                  {isSubmitting ? "Submitting..." : "Submit Item for Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-neutral-50 border-t">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Frequently Asked Questions" centered />
            <div className="space-y-4 mt-8">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">What brands do you accept?</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We focus on high-quality, durable menswear brands that have a proven track record of longevity. 
                    Think brands like Patagonia, Carhartt, Levi's, R.M. Williams, and similar. We generally do not 
                    accept fast-fashion brands as they do not align with our circular model.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">How is the token value determined?</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our team assesses each item based on brand, condition, item type, style, and current market demand. 
                    We then make a token offer based on what we believe is a fair resale value within our closed-loop system. 
                    Remember, 1 token is equivalent to $1.00 NZD in store credit.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">What if I don't like my token offer?</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You are free to accept, decline, or make a counter-offer. Our goal is to find a value that works for both 
                    parties. If we can't reach an agreement, there's no obligation to proceed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="py-16 bg-white border-b">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Shipping Your Item To Us" centered />
            <div className="mt-8 text-center text-muted-foreground">
              <p>Once you accept our token offer, we make shipping your item to us simple and free.</p>
            </div>
            <div className="mt-8 bg-neutral-100/80 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Prepaid Shipping Label</h3>
                  <p className="text-sm text-muted-foreground">
                    We will email you a prepaid, tracked shipping label. Simply print it out, attach it to your package, 
                    and drop it off at your nearest post office. Please ensure your item is securely packaged 
                    to protect the garment during transit. If you do not have suitable packaging, 
                    we can arrange for a prepaid satchel to be sent to you.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Free Returns</h3>
                  <p className="text-sm text-muted-foreground">
                    If for any reason your item is not accepted after inspection, we will return it to you 
                    free of charge. You will never be out of pocket for shipping costs.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">Rural Delivery Notice</h3>
                  <p className="text-sm text-amber-700">
                    Please note: Rural delivery addresses may incur additional shipping time. 
                    In some cases, rural delivery surcharges may apply. We will contact you 
                    before processing if your address falls within a rural delivery zone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Accept */}
      <section className="py-16 bg-neutral-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="What We Accept" centered />
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">We Love</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Premium brands (Levi's, Carhartt, Nike, Ralph Lauren, etc.)</li>
                  <li>Items in excellent or like-new condition</li>
                  <li>Classic styles that hold their value</li>
                  <li>Complete items with all original parts</li>
                  <li>Clean, odor-free garments</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-700 mb-3">We Cannot Accept</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Fast fashion or budget brands</li>
                  <li>Items with significant damage or stains</li>
                  <li>Counterfeit or replica items</li>
                  <li>Underwear, swimwear, or intimates</li>
                  <li>Items with strong odors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
