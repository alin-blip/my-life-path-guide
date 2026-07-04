import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveModal, ResponsiveModalDescription, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, Plus, DollarSign, Eye, EyeOff, Trash2, 
  FileText, Video, BookOpen, Layout, Loader2, TrendingUp 
} from 'lucide-react';
import { useCoachContent, CoachContent } from '@/hooks/useCoachContent';
import { format } from 'date-fns';

interface CoachContentManagerProps {
  coachProfileId: string;
}

const CONTENT_TYPES = [
  { value: 'resource', label: 'Resource', icon: FileText },
  { value: 'course', label: 'Mini Course', icon: Video },
  { value: 'ebook', label: 'E-Book', icon: BookOpen },
  { value: 'template', label: 'Template', icon: Layout },
];

export const CoachContentManager: React.FC<CoachContentManagerProps> = ({ coachProfileId }) => {
  const { content, purchases, loading, stats, createContent, publishContent, unpublishContent, deleteContent } = useCoachContent(coachProfileId);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    contentType: 'resource',
    price: '',
    contentUrl: '',
  });

  const handleCreate = async () => {
    if (!newContent.title.trim() || !newContent.price) return;
    
    setCreating(true);
    const priceCents = Math.round(parseFloat(newContent.price) * 100);
    
    await createContent(
      newContent.title.trim(),
      newContent.description.trim(),
      newContent.contentType,
      priceCents,
      newContent.contentUrl.trim() || undefined
    );
    
    setCreating(false);
    setIsCreateOpen(false);
    setNewContent({ title: '', description: '', contentType: 'resource', price: '', contentUrl: '' });
  };

  const handleTogglePublish = async (item: CoachContent) => {
    if (item.is_published) {
      await unpublishContent(item.id);
    } else {
      await publishContent(item.id);
    }
  };

  const handleDelete = async (item: CoachContent) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await deleteContent(item.id);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    return found ? found.icon : FileText;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Content</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalContent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Published</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.publishedContent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Sales</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Your Earnings (70%)</span>
            </div>
            <p className="text-2xl font-bold mt-1">€{stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Content</CardTitle>
            <CardDescription>
              Create and sell resources to your clients. You earn 70% of each sale.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
          <ResponsiveModal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <ResponsiveModalHeader>
                <ResponsiveModalTitle>Create New Content</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                  Add a new resource to sell to your clients
                </ResponsiveModalDescription>
              </ResponsiveModalHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="e.g., Morning Routine Checklist"
                    value={newContent.title}
                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe what's included..."
                    value={newContent.description}
                    onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newContent.contentType}
                      onValueChange={(value) => setNewContent(prev => ({ ...prev, contentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price (EUR)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="9.99"
                      value={newContent.price}
                      onChange={(e) => setNewContent(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Content URL (optional)</label>
                  <Input
                    placeholder="https://..."
                    value={newContent.contentUrl}
                    onChange={(e) => setNewContent(prev => ({ ...prev, contentUrl: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link to your PDF, video, or other content
                  </p>
                </div>
                <Button 
                  onClick={handleCreate} 
                  disabled={creating || !newContent.title.trim() || !newContent.price}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Content'
                  )}
                </Button>
              </div>
          </ResponsiveModal>

        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No content yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first resource to start earning 70% commissions
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Content
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => {
                  const TypeIcon = getContentTypeIcon(item.content_type);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{item.content_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        €{(item.price_cents / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.total_sales}
                      </TableCell>
                      <TableCell>
                        {item.is_published ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublish(item)}
                            title={item.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {item.is_published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Your content purchases from clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Your Share (70%)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.slice(0, 10).map((purchase) => {
                  const contentItem = content.find(c => c.id === purchase.content_id);
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {format(new Date(purchase.purchased_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {contentItem?.title || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        €{(purchase.amount_paid / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-500 font-medium">
                        €{(purchase.coach_share / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
