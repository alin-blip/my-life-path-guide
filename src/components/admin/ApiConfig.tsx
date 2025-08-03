
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const ApiConfig: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [pluuxUrl, setPluuxUrl] = useState('');
  const { toast } = useToast();
  
  // In a real implementation, this would send data to your webhook
  const handleIntegration = () => {
    console.log('Integrating with webhook URL:', webhookUrl);
    console.log('Pluux.io base URL:', pluuxUrl);
    // Here you would make an API call to your webhook
    toast({
      title: "Integration successful",
      description: "Webhook configured for online courses.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>
          Configure integration with external services and APIs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="webhook-url">Webhook URL</label>
            <Input 
              id="webhook-url" 
              placeholder="https://your-webhook-url.com" 
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="pluux-url">Base URL</label>
            <Input 
              id="pluux-url" 
              placeholder="https://app.pluux.io/your-account" 
              value={pluuxUrl}
              onChange={(e) => setPluuxUrl(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            This webhook will be used to fetch and update your online courses catalog from external sources.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleIntegration}>Save Configuration</Button>
      </CardFooter>
    </Card>
  );
};
