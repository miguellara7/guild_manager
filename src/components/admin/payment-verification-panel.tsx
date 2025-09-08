'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Coins,
  User,
  Calendar,
  AlertTriangle,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PendingVerification {
  id: string;
  paymentId: string;
  user: {
    characterName: string;
    world: string;
    email?: string;
  };
  amount: number;
  fromCharacter: string;
  toCharacter: string;
  transferTimestamp: string;
  screenshot?: string;
  submittedAt: string;
  plan: string;
}

export default function PaymentVerificationPanel() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/admin/pending-payments');
      if (response.ok) {
        const data = await response.json();
        setVerifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          notes: adminNotes,
        }),
      });

      if (response.ok) {
        toast.success('Payment approved successfully');
        setSelectedVerification(null);
        setAdminNotes('');
        fetchPendingVerifications();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('Approve payment error:', error);
      toast.error('An error occurred while approving payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verificationId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/reject-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          reason,
        }),
      });

      if (response.ok) {
        toast.success('Payment rejected successfully');
        setSelectedVerification(null);
        setAdminNotes('');
        fetchPendingVerifications();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Reject payment error:', error);
      toast.error('An error occurred while rejecting payment');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification</CardTitle>
          <CardDescription>Review and approve pending Tibia Coins payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span>Payment Verification</span>
          {verifications.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {verifications.length} pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Review and approve pending Tibia Coins payments from users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verifications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No pending payment verifications at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Verify Tibia Coins transfers carefully. 
                Check character names, amounts, and timestamps before approving.
              </AlertDescription>
            </Alert>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transfer Details</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{verification.user.characterName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {verification.user.world}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {verification.plan}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-lg">{verification.amount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>From:</strong> {verification.fromCharacter}</div>
                          <div><strong>To:</strong> {verification.toCharacter}</div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(verification.transferTimestamp)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(verification.submittedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVerification(verification)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Verification Review</DialogTitle>
                              <DialogDescription>
                                Review the payment details and approve or reject the verification
                              </DialogDescription>
                            </DialogHeader>

                            {selectedVerification && (
                              <div className="space-y-6">
                                {/* Payment Details */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Payment Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label className="text-sm text-muted-foreground">User</Label>
                                        <p className="font-medium">{selectedVerification.user.characterName}</p>
                                        <p className="text-sm text-muted-foreground">{selectedVerification.user.world}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-muted-foreground">Plan</Label>
                                        <p className="font-medium">{selectedVerification.plan} Plan</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-muted-foreground">Amount</Label>
                                        <div className="flex items-center space-x-1">
                                          <Coins className="w-4 h-4 text-yellow-500" />
                                          <span className="font-medium text-lg">{selectedVerification.amount}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-muted-foreground">Payment ID</Label>
                                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                          {selectedVerification.paymentId}
                                        </code>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Transfer Details */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Transfer Details</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label className="text-sm text-muted-foreground">From Character</Label>
                                        <p className="font-medium">{selectedVerification.fromCharacter}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-muted-foreground">To Character</Label>
                                        <p className="font-medium">{selectedVerification.toCharacter}</p>
                                      </div>
                                      <div className="md:col-span-2">
                                        <Label className="text-sm text-muted-foreground">Transfer Time</Label>
                                        <p className="font-medium">{formatDate(selectedVerification.transferTimestamp)}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Screenshot */}
                                {selectedVerification.screenshot && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center space-x-2">
                                        <Image className="w-5 h-5" />
                                        <span>Screenshot Evidence</span>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <img
                                        src={selectedVerification.screenshot}
                                        alt="Transfer screenshot"
                                        className="max-w-full h-auto rounded-lg border"
                                      />
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Admin Notes */}
                                <div className="space-y-2">
                                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                                  <Textarea
                                    id="adminNotes"
                                    placeholder="Add notes about this verification..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                  <Button
                                    onClick={() => handleApprove(selectedVerification.id)}
                                    disabled={processing}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {processing ? 'Approving...' : 'Approve Payment'}
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(selectedVerification.id, adminNotes || 'Payment rejected by admin')}
                                    disabled={processing}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {processing ? 'Rejecting...' : 'Reject Payment'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


