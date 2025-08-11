"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout, Button, Card, Input, Label } from "@nexus/ui";
import { Check, Eye, EyeOff } from "lucide-react";
import { 
  FaSlack, 
  FaGithub, 
  FaJira, 
  FaSalesforce, 
  FaAws 
} from "react-icons/fa";
import { api } from "@/trpc/react";
import { ServiceType } from "@prisma/client";
import { toast } from "sonner";

const serviceIcons = {
  slack: FaSlack,
  github: FaGithub,
  jira: FaJira,
  salesforce: FaSalesforce,
  aws: FaAws,
};

const serviceLabels = {
  slack: "Slack",
  github: "GitHub",
  jira: "Jira",
  salesforce: "Salesforce",
  aws: "AWS",
};

interface ServiceFormData {
  // OAuth fields
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  
  // Slack
  workspaceUrl?: string;
  botToken?: string;
  signingSecret?: string;
  
  // GitHub
  personalAccessToken?: string;
  organization?: string;
  
  // Jira
  domain?: string;
  email?: string;
  apiToken?: string;
  
  // Salesforce
  instanceUrl?: string;
  
  // AWS
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
}

export default function CredentialsPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<ServiceType>("slack");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<ServiceFormData>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // TODO: Get actual company ID from context/session
  // For now, using a placeholder. In production, this would come from auth context
  const companyId = "acme-corp-id";
  
  // Fetch all credentials for the company
  const { data: credentials, refetch } = api.credentials.getByCompany.useQuery(
    { companyId },
    { enabled: !!companyId }
  );
  
  // Fetch specific credential when service is selected
  const { data: selectedCredential } = api.credentials.getByService.useQuery(
    { companyId, service: selectedService },
    { enabled: !!companyId && !!selectedService }
  );
  
  // Save mutation
  const saveMutation = api.credentials.upsert.useMutation({
    onSuccess: () => {
      toast.success("Credentials saved successfully");
      setIsDirty(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });
  
  // Load credential data when selected service changes
  useEffect(() => {
    if (selectedCredential) {
      const config = selectedCredential.config as ServiceFormData;
      setFormData({
        clientId: selectedCredential.clientId || "",
        clientSecret: selectedCredential.clientSecret || "",
        accessToken: selectedCredential.accessToken || "",
        refreshToken: selectedCredential.refreshToken || "",
        ...config,
      });
    } else {
      setFormData({});
    }
    setIsDirty(false);
  }, [selectedCredential]);
  
  const handleInputChange = (field: keyof ServiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };
  
  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleSave = () => {
    saveMutation.mutate({
      companyId,
      service: selectedService,
      name: "Default",
      ...formData,
      config: formData,
    });
  };
  
  const isServiceConnected = (service: ServiceType) => {
    return credentials?.some(c => c.service === service && c.isConnected);
  };
  
  const renderServiceForm = () => {
    switch (selectedService) {
      case "slack":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="workspaceUrl">Workspace URL</Label>
              <Input
                id="workspaceUrl"
                type="text"
                placeholder="acme-corp.slack.com"
                value={formData.workspaceUrl || ""}
                onChange={(e) => handleInputChange("workspaceUrl", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="botToken">Bot User OAuth Token</Label>
              <div className="relative">
                <Input
                  id="botToken"
                  type={showSecrets.botToken ? "text" : "password"}
                  placeholder={formData.botToken ? "••••••••••••" : "xoxb-..."}
                  value={formData.botToken || ""}
                  onChange={(e) => handleInputChange("botToken", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("botToken")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.botToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signingSecret">Signing Secret</Label>
              <div className="relative">
                <Input
                  id="signingSecret"
                  type={showSecrets.signingSecret ? "text" : "password"}
                  placeholder={formData.signingSecret ? "••••••••" : "Enter signing secret"}
                  value={formData.signingSecret || ""}
                  onChange={(e) => handleInputChange("signingSecret", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("signingSecret")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.signingSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </>
        );
        
      case "github":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                type="text"
                placeholder="acme-corp"
                value={formData.organization || ""}
                onChange={(e) => handleInputChange("organization", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personalAccessToken">Personal Access Token</Label>
              <div className="relative">
                <Input
                  id="personalAccessToken"
                  type={showSecrets.personalAccessToken ? "text" : "password"}
                  placeholder={formData.personalAccessToken ? "••••••••••••" : "ghp_..."}
                  value={formData.personalAccessToken || ""}
                  onChange={(e) => handleInputChange("personalAccessToken", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("personalAccessToken")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.personalAccessToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </>
        );
        
      case "jira":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                type="text"
                placeholder="acme.atlassian.net"
                value={formData.domain || ""}
                onChange={(e) => handleInputChange("domain", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@acme.com"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <div className="relative">
                <Input
                  id="apiToken"
                  type={showSecrets.apiToken ? "text" : "password"}
                  placeholder={formData.apiToken ? "••••••••••••" : "Enter API token"}
                  value={formData.apiToken || ""}
                  onChange={(e) => handleInputChange("apiToken", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("apiToken")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.apiToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </>
        );
        
      case "salesforce":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="instanceUrl">Instance URL</Label>
              <Input
                id="instanceUrl"
                type="url"
                placeholder="https://acme.my.salesforce.com"
                value={formData.instanceUrl || ""}
                onChange={(e) => handleInputChange("instanceUrl", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter client ID"
                value={formData.clientId || ""}
                onChange={(e) => handleInputChange("clientId", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets.clientSecret ? "text" : "password"}
                  placeholder={formData.clientSecret ? "••••••••••••" : "Enter client secret"}
                  value={formData.clientSecret || ""}
                  onChange={(e) => handleInputChange("clientSecret", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("clientSecret")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.clientSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refreshToken">Refresh Token</Label>
              <div className="relative">
                <Input
                  id="refreshToken"
                  type={showSecrets.refreshToken ? "text" : "password"}
                  placeholder={formData.refreshToken ? "••••••••••••" : "Enter refresh token"}
                  value={formData.refreshToken || ""}
                  onChange={(e) => handleInputChange("refreshToken", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("refreshToken")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.refreshToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </>
        );
        
      case "aws":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input
                id="accessKeyId"
                type="text"
                placeholder="AKIA..."
                value={formData.accessKeyId || ""}
                onChange={(e) => handleInputChange("accessKeyId", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <div className="relative">
                <Input
                  id="secretAccessKey"
                  type={showSecrets.secretAccessKey ? "text" : "password"}
                  placeholder={formData.secretAccessKey ? "••••••••••••" : "Enter secret access key"}
                  value={formData.secretAccessKey || ""}
                  onChange={(e) => handleInputChange("secretAccessKey", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("secretAccessKey")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets.secretAccessKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                type="text"
                placeholder="us-east-1"
                value={formData.region || ""}
                onChange={(e) => handleInputChange("region", e.target.value)}
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <AppLayout
      title="Credentials"
      activeNavItem="credentials"
      userRole="client"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
      onLogoutClick={() => router.push('/auth/logout')}
    >
      <div className="pt-16">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* Services List */}
              <div className="col-span-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Third Party Services
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(serviceIcons) as ServiceType[]).map((service) => {
                      const Icon = serviceIcons[service];
                      const isConnected = isServiceConnected(service);
                      const isSelected = selectedService === service;
                      
                      return (
                        <button
                          key={service}
                          onClick={() => setSelectedService(service)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isSelected 
                              ? "bg-muted" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{serviceLabels[service]}</span>
                          </div>
                          {isConnected && (
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-500">Connected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
              
              {/* Credential Form */}
              <div className="col-span-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = serviceIcons[selectedService];
                        return <Icon className="w-6 h-6 text-muted-foreground" />;
                      })()}
                      <h2 className="text-xl font-semibold">
                        {serviceLabels[selectedService]} Credentials
                      </h2>
                    </div>
                    {isServiceConnected(selectedService) && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">Connected</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {renderServiceForm()}
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleSave}
                      disabled={!isDirty || saveMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}