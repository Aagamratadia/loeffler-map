"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, UserPlus, Trash2, Loader2, ShieldAlert, Users, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

import Image from "next/image";

interface User {
  _id: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  hasPassword: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        toast.error("Access denied. Admins only.");
        router.push("/");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || newPhone.length < 10) {
      toast.error("Enter a valid phone number (at least 10 digits).");
      return;
    }
    setAdding(true);
    try {
      const formattedNumber = newPhone.startsWith("+") ? newPhone : `+91${newPhone}`;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedNumber, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`User ${formattedNumber} added as ${newRole}.`);
        setNewPhone("");
        await fetchUsers();
      } else {
        toast.error(data.error || "Failed to add user.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (phoneNumber: string, id: string) => {
    if (!confirm(`Remove ${phoneNumber} from the whitelist?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User removed.");
        await fetchUsers();
      } else {
        toast.error(data.error || "Failed to remove user.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image src="/logo.png" alt="Loeffler Logo" fill className="object-contain" priority />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Loeffler Assessment
                </h1>
                <p className="text-xs text-slate-600">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-blue-200"
              >
                ← Back to App
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-7 w-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        </div>

        {/* Add User Form */}
        <Card className="mb-8 shadow-md border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add Whitelisted User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="tel"
                placeholder="Phone number (e.g. 9876543210)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="flex-1 h-10"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[110px]"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" disabled={adding} className="h-10 px-5">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add User"}
              </Button>
            </form>
            <p className="text-xs text-slate-500 mt-2">
              Country code +91 will be added automatically if omitted.
            </p>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-slate-600" />
              Whitelisted Users
              <Badge variant="outline" className="ml-auto text-slate-600">
                {users.length} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No users yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{user.phoneNumber}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={
                            user.role === "admin"
                              ? "text-blue-700 border-blue-300 bg-blue-50 text-xs"
                              : "text-slate-600 border-slate-300 text-xs"
                          }
                        >
                          {user.role}
                        </Badge>
                        {user.hasPassword ? (
                          <span className="text-xs text-green-600">● Password set</span>
                        ) : (
                          <span className="text-xs text-amber-500">○ No password yet</span>
                        )}
                        <span className="text-xs text-slate-400">
                          Added {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.phoneNumber, user._id)}
                      disabled={deletingId === user._id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
