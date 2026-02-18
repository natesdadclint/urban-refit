import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Package, Upload, RefreshCw, Loader2, CheckCircle, 
  ArrowRight, Coins, Info
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";

const CATEGORIES = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "like_new", label: "Like New - Never worn or worn once" },
  { value: "excellent", label: "Excellent - Minimal signs of wear" },
  { value: "good", label: "Good - Some signs of wear" },
  { value: "fair", label: "Fair - Visible wear but functional" },
];

export default function CourierReturn() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemCategory, setItemCategory] = useState<string>("");
  const [itemSize, setItemSize] = useState("");
  const [itemCondition, setItemCondition] = useState<string>("");
  const [itemDescription, setItemDescription] = useState("");
  const [image1Url, setImage1Url] = useState("");
  const [image2Url, setImage2Url] = useState("");
  
  const createReturnMutation = trpc.courierReturn.create.useMutation({
    onSuccess: (data) => {
      toast.success("Return request submitted successfully!");
      setStep(3);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit return request");
    },
  });
  
  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json();
      
      if (imageNumber === 1) {
        setImage1Url(url);
      } else {
        setImage2Url(url);
      }
      
      toast.success(`Image ${imageNumber} uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = () => {
    if (!itemName || !itemCategory || !itemCondition) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    createReturnMutation.mutate({
      itemName,
      itemBrand: itemBrand || undefined,
      itemCategory: itemCategory as any,
      itemSize: itemSize || undefined,
      itemCondition: itemCondition as any,
      itemDescription: itemDescription || undefined,
      image1Url: image1Url || undefined,
      image2Url: image2Url || undefined,
    });
  };
  
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <RefreshCw className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <PageHeader
              title="Sign In Required"
              subtitle="Please sign in to return garments and earn tokens."
              variant="compact"
              className="mb-8"
            />
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Return Garments"
            subtitle="Give your clothes a second life and earn tokens"
            variant="compact"
            className="text-center mb-8"
          />
          
          {/* How it Works */}
          {step === 1 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">1. Submit Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload photos and describe your garment
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">2. Ship to Us</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a prepaid shipping label
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">3. Earn Tokens</h3>
                    <p className="text-sm text-muted-foreground">
                      Get 25% of the resale value in tokens
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Token Value:</strong> Tokens can be converted to spend limit (1 token = NZ$1.00) 
                    or donated to charity. Spend limit applies to orders of 3+ items.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
                1
              </div>
              <span className="hidden md:inline">Details</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
                2
              </div>
              <span className="hidden md:inline">Photos</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
                3
              </div>
              <span className="hidden md:inline">Done</span>
            </div>
          </div>
          
          {/* Step 1: Item Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Tell us about the garment you'd like to return
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Vintage Levi's Denim Jacket"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemBrand">Brand</Label>
                    <Input
                      id="itemBrand"
                      placeholder="e.g., Levi's"
                      value={itemBrand}
                      onChange={(e) => setItemBrand(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemSize">Size</Label>
                    <Input
                      id="itemSize"
                      placeholder="e.g., M, 32, 8"
                      value={itemSize}
                      onChange={(e) => setItemSize(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={itemCategory} onValueChange={setItemCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select value={itemCondition} onValueChange={setItemCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Textarea
                    id="itemDescription"
                    placeholder="Any additional details about the item (measurements, flaws, special features)"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!itemName || !itemCategory || !itemCondition}
                >
                  Continue to Photos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Photos */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Photos</CardTitle>
                <CardDescription>
                  Add clear photos of your garment (front and back views recommended)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Image 1 */}
                  <div className="space-y-2">
                    <Label>Front View</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {image1Url ? (
                        <div className="relative">
                          <img 
                            src={image1Url} 
                            alt="Front view" 
                            className="w-full h-48 object-cover rounded"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImage1Url("")}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-8">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload front view
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 1);
                            }}
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Image 2 */}
                  <div className="space-y-2">
                    <Label>Back View</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {image2Url ? (
                        <div className="relative">
                          <img 
                            src={image2Url} 
                            alt="Back view" 
                            className="w-full h-48 object-cover rounded"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImage2Url("")}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-8">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload back view
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 2);
                            }}
                            disabled={isUploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={createReturnMutation.isPending}
                  >
                    {createReturnMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Return Request"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Free prepaid shipping label included. Tokens credited within 48 hours of inspection. 1 token = NZ$1.00.
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Success */}
          {step === 3 && (
            <Card>
              <CardContent className="pt-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <SectionHeader title="Return Request Submitted!" centered className="mb-2" />
                <p className="text-muted-foreground mb-6">
                  We'll review your submission and send you a prepaid shipping label within 24-48 hours.
                </p>
                <div className="p-4 bg-muted rounded-lg mb-6">
                  <p className="text-sm">
                    <strong>What's next?</strong><br />
                    1. Wait for our review and shipping label<br />
                    2. Pack your item securely<br />
                    3. Drop off at any courier location<br />
                    4. Receive tokens once we inspect the item
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => setLocation('/profile')}>
                    View My Returns
                  </Button>
                  <Button onClick={() => {
                    setStep(1);
                    setItemName("");
                    setItemBrand("");
                    setItemCategory("");
                    setItemSize("");
                    setItemCondition("");
                    setItemDescription("");
                    setImage1Url("");
                    setImage2Url("");
                  }}>
                    Return Another Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
