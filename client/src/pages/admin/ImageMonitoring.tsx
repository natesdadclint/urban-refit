import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, PlayCircle, TrendingUp, Image, FileText } from "lucide-react";
import { toast } from "sonner";

export default function ImageMonitoring() {

  const [isValidating, setIsValidating] = useState(false);
  
  const statsQuery = trpc.admin.getValidationStats.useQuery();
  const historyQuery = trpc.admin.getValidationHistory.useQuery({ limit: 10 });
  const validateMutation = trpc.admin.validateAllImages.useMutation({
    onSuccess: (data) => {
      toast.success(`Validation Complete: Checked ${data.totalChecked} images: ${data.validCount} valid, ${data.invalidCount} invalid`);
      setIsValidating(false);
      statsQuery.refetch();
      historyQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Validation Failed: ${error.message}`);
      setIsValidating(false);
    },
  });
  
  const handleRunValidation = () => {
    setIsValidating(true);
    validateMutation.mutate();
  };
  
  const stats = statsQuery.data;
  const history = historyQuery.data || [];
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image URL Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and validate image URLs across products, blog posts, and other assets
          </p>
        </div>
        <Button 
          onClick={handleRunValidation} 
          disabled={isValidating}
          size="lg"
        >
          {isValidating ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Validation
            </>
          )}
        </Button>
      </div>
      
      {/* Overall Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAssets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalProducts || 0} products, {stats?.totalBlogs || 0} blogs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Images</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.validImages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Accessible URLs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invalid Images</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.invalidImages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Broken or missing URLs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lastRunDate 
                ? new Date(stats.lastRunDate).toLocaleDateString()
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.lastRunDate 
                ? new Date(stats.lastRunDate).toLocaleTimeString()
                : "Run validation to start"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Asset Type Breakdown */}
      {stats?.byAssetType && Object.keys(stats.byAssetType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown by Asset Type</CardTitle>
            <CardDescription>
              Validation results grouped by asset category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(stats.byAssetType).map(([type, data]) => (
                <Card key={type} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {type === 'product' && <Image className="h-5 w-5 text-blue-600" />}
                      {type === 'blog' && <FileText className="h-5 w-5 text-purple-600" />}
                      <CardTitle className="text-lg capitalize">{type}s</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold">{data.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Valid:</span>
                      <span className="font-semibold text-green-600">{data.valid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Invalid:</span>
                      <span className="font-semibold text-red-600">{data.invalid}</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${data.invalid > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${(data.valid / data.total * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        {((data.valid / data.total) * 100).toFixed(1)}% valid
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Validation History */}
      <Card>
        <CardHeader>
          <CardTitle>Validation History</CardTitle>
          <CardDescription>
            Recent validation runs and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No validation history yet</p>
              <p className="text-sm">Click "Run Validation" to start monitoring</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Total Checks</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead>Invalid</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((run) => {
                  const successRate = ((run.validCount / run.totalChecks) * 100).toFixed(1);
                  const hasIssues = run.invalidCount > 0;
                  
                  return (
                    <TableRow key={run.runId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(run.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(run.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{run.totalChecks}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {run.validCount}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {run.invalidCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className={`h-2 rounded-full ${hasIssues ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hasIssues ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Issues Found
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            All Valid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
