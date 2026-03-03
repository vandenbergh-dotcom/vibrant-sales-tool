"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "@/components/data-upload/upload-zone";
import { toast } from "sonner";

interface DataCounts {
  products: number;
  stores: number;
  purchaseHistory: number;
  promotions: number;
  source: string;
  loadedAt?: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [dataCounts, setDataCounts] = useState<DataCounts | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const fetchDataStatus = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      setDataCounts(data);
    } catch {
      toast.error("Failed to fetch data status");
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchDataStatus();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPassword(passwordInput);
    setAuthenticated(true);
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Reset to demo data successfully");
        fetchDataStatus();
      } else {
        toast.error(data.error || "Reset failed");
        if (res.status === 401) setAuthenticated(false);
      }
    } catch {
      toast.error("Failed to reset data");
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <Button type="submit" className="w-full bg-[#004B87] hover:bg-[#003A6B]">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Data Management</h1>

      {/* Current Data Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Data</h2>
            <Badge variant={dataCounts?.source === "demo" ? "secondary" : "default"}>
              {dataCounts?.source === "demo" ? "Demo Data" : "Custom Data"}
            </Badge>
          </div>

          {dataCounts && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#004B87]">{dataCounts.products}</p>
                <p className="text-xs text-gray-500">Products</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#004B87]">{dataCounts.stores}</p>
                <p className="text-xs text-gray-500">Stores</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#004B87]">{dataCounts.purchaseHistory}</p>
                <p className="text-xs text-gray-500">Transactions</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#004B87]">{dataCounts.promotions}</p>
                <p className="text-xs text-gray-500">Promotions</p>
              </div>
            </div>
          )}

          {dataCounts?.loadedAt && (
            <p className="text-xs text-gray-400 mt-3">
              Last updated: {new Date(dataCounts.loadedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upload */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Upload New Data</h2>
        <UploadZone onUploadComplete={() => fetchDataStatus()} />
      </div>

      {/* Reset */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Reset Data</h2>
          <p className="text-sm text-gray-500 mb-4">
            Reset all data back to the demo dataset. This cannot be undone.
          </p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleReset}>
            Reset to Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
