import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Search,
  Users,
  DollarSign,
  Crown,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const MEMBERSHIP_COLORS = {
  free: "bg-gray-100 text-gray-800",
  basic: "bg-blue-100 text-blue-800",
  premium: "bg-purple-100 text-purple-800",
  lifetime: "bg-amber-100 text-amber-800",
};

const PAYMENT_COLORS = {
  unpaid: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  expired: "bg-orange-100 text-orange-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const me = await base44.auth.me();
      setCurrentUser(me);
      if (me.role !== "admin") {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      await loadUsers();
    } catch (e) {
      console.error(e);
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      console.error("Failed to load users:", e);
      alert("Failed to load users: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role,
          membership_status: editingUser.membership_status,
          payment_status: editingUser.payment_status,
          payment_amount: editingUser.payment_amount
            ? parseFloat(editingUser.payment_amount)
            : null,
          payment_date: editingUser.payment_date || null,
          subscription_expires_at: editingUser.subscription_expires_at || null,
          notes: editingUser.notes || null,
        })
        .eq("id", editingUser.id);
      if (error) throw error;
      await loadUsers();
      setEditingUser(null);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!deletingUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingUser.id);
      if (error) throw error;
      await loadUsers();
      setDeletingUser(null);
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.membership_status?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: users.length,
    paid: users.filter((u) => u.payment_status === "paid").length,
    premium: users.filter(
      (u) => u.membership_status === "premium" || u.membership_status === "lifetime"
    ).length,
    revenue: users
      .filter((u) => u.payment_status === "paid" && u.payment_amount)
      .reduce((sum, u) => sum + parseFloat(u.payment_amount || 0), 0),
  };

  if (accessDenied) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users, memberships, and payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid Users</div>
                <div className="text-2xl font-bold">{stats.paid}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Premium</div>
                <div className="text-2xl font-bold">{stats.premium}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by email, name, role, or membership..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Membership</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {u.full_name || "Unnamed"}
                          </div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={u.role === "admin" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                        {u.role || "user"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={MEMBERSHIP_COLORS[u.membership_status] || MEMBERSHIP_COLORS.free}>
                        {u.membership_status || "free"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={PAYMENT_COLORS[u.payment_status] || PAYMENT_COLORS.unpaid}>
                        {u.payment_status || "unpaid"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {u.payment_amount ? `$${parseFloat(u.payment_amount).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setEditingUser({ ...u })}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {u.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingUser(u)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={editingUser.email || ""} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={editingUser.role || "user"}
                    onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Membership</Label>
                  <Select
                    value={editingUser.membership_status || "free"}
                    onValueChange={(v) => setEditingUser({ ...editingUser, membership_status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Status</Label>
                  <Select
                    value={editingUser.payment_status || "unpaid"}
                    onValueChange={(v) => setEditingUser({ ...editingUser, payment_status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingUser.payment_amount || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, payment_amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={editingUser.payment_date ? editingUser.payment_date.split("T")[0] : ""}
                    onChange={(e) => setEditingUser({ ...editingUser, payment_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subscription Expires</Label>
                  <Input
                    type="date"
                    value={editingUser.subscription_expires_at ? editingUser.subscription_expires_at.split("T")[0] : ""}
                    onChange={(e) => setEditingUser({ ...editingUser, subscription_expires_at: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={editingUser.notes || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  placeholder="Internal notes about this user..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingUser} onOpenChange={(o) => !o && setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                This will permanently delete <strong>{deletingUser?.email}</strong> and all their data.
                This cannot be undone.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Button>
            <Button onClick={deleteUser} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
