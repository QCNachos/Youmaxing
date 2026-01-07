'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, ExternalLink, Key, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyStatus {
  openai: {
    hasKey: boolean;
    isValid: boolean;
    lastValidated: string | null;
  };
  anthropic: {
    hasKey: boolean;
    isValid: boolean;
    lastValidated: string | null;
  };
}

export function ApiKeySettings() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [validating, setValidating] = useState<'openai' | 'anthropic' | null>(null);
  const [deleting, setDeleting] = useState<'openai' | 'anthropic' | null>(null);
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Load current API key status
  useEffect(() => {
    fetchKeyStatus();
  }, []);

  const fetchKeyStatus = async () => {
    try {
      const response = await fetch('/api/keys/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch key status:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAndSave = async (provider: 'openai' | 'anthropic', key: string) => {
    if (!key.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setValidating(provider);

    try {
      // First validate the key
      const validateResponse = await fetch('/api/keys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok || !validateData.valid) {
        toast.error(validateData.error || 'Invalid API key');
        setValidating(null);
        return;
      }

      // If valid, save it
      const saveResponse = await fetch('/api/keys/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: key, isValid: true }),
      });

      if (saveResponse.ok) {
        toast.success(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key saved successfully!`);
        // Clear the input
        if (provider === 'openai') {
          setOpenaiKey('');
        } else {
          setAnthropicKey('');
        }
        // Refresh status
        await fetchKeyStatus();
      } else {
        toast.error('Failed to save API key');
      }
    } catch (error) {
      console.error('Error validating/saving key:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setValidating(null);
    }
  };

  const deleteKey = async (provider: 'openai' | 'anthropic') => {
    setDeleting(provider);

    try {
      const response = await fetch('/api/keys/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (response.ok) {
        toast.success(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key deleted`);
        await fetchKeyStatus();
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explainer */}
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          <strong>Bring Your Own Key (BYOK)</strong> - Use your own OpenAI or Anthropic API keys for unlimited AI messages.
          Your keys are encrypted and never shared. You only pay OpenAI/Anthropic directly (typically $5-20/month).
        </AlertDescription>
      </Alert>

      {/* OpenAI API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                OpenAI API Key
                {status?.openai.isValid && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {status?.openai.hasKey && !status?.openai.isValid && (
                  <Badge variant="destructive">
                    <X className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                For GPT-3.5, GPT-4, and other OpenAI models
              </CardDescription>
            </div>
            {status?.openai.hasKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteKey('openai')}
                disabled={deleting === 'openai'}
              >
                {deleting === 'openai' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.openai.hasKey ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="openai-key">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      disabled={validating === 'openai'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    >
                      {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={() => validateAndSave('openai', openaiKey)}
                    disabled={validating === 'openai' || !openaiKey.trim()}
                  >
                    {validating === 'openai' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Validate & Save'
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Get your OpenAI API key →
                </a>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ✓ OpenAI API key is configured and active
              </p>
              {status.openai.lastValidated && (
                <p className="text-xs text-muted-foreground">
                  Last validated: {new Date(status.openai.lastValidated).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anthropic API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Anthropic API Key
                {status?.anthropic.isValid && (
                  <Badge variant="default" className="bg-green-500">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {status?.anthropic.hasKey && !status?.anthropic.isValid && (
                  <Badge variant="destructive">
                    <X className="h-3 w-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                For Claude 3 Haiku, Sonnet, and Opus models
              </CardDescription>
            </div>
            {status?.anthropic.hasKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteKey('anthropic')}
                disabled={deleting === 'anthropic'}
              >
                {deleting === 'anthropic' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.anthropic.hasKey ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="anthropic-key"
                      type={showAnthropicKey ? 'text' : 'password'}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-..."
                      disabled={validating === 'anthropic'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                    >
                      {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={() => validateAndSave('anthropic', anthropicKey)}
                    disabled={validating === 'anthropic' || !anthropicKey.trim()}
                  >
                    {validating === 'anthropic' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Validate & Save'
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Get your Anthropic API key →
                </a>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ✓ Anthropic API key is configured and active
              </p>
              {status.anthropic.lastValidated && (
                <p className="text-xs text-muted-foreground">
                  Last validated: {new Date(status.anthropic.lastValidated).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Estimate */}
      {(status?.openai.isValid || status?.anthropic.isValid) && (
        <Alert>
          <AlertDescription>
            <strong>Estimated costs:</strong> With BYOK, you typically pay $5-20/month directly to OpenAI/Anthropic
            depending on your usage. Check your usage at{' '}
            <a
              href="https://platform.openai.com/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              OpenAI Dashboard
            </a>
            {' '}or{' '}
            <a
              href="https://console.anthropic.com/settings/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Anthropic Console
            </a>
            .
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}


