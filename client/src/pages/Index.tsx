
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  Plus,
  Search,
  Filter
} from "lucide-react";
import type { Customer, SalesData } from "@shared/schema";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customers from API
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch sales data from API
  const { data: salesData = [], isLoading: salesLoading } = useQuery<SalesData[]>({
    queryKey: ['/api/sales-data'],
  });

  const pipelineData = [
    { name: 'Prospects', value: 45, color: '#8884d8' },
    { name: 'Qualified', value: 32, color: '#82ca9d' },
    { name: 'Proposal', value: 18, color: '#ffc658' },
    { name: 'Closed Won', value: 12, color: '#ff7c7c' }
  ];

  // Calculate metrics from real data
  const totalCustomers = customers.length;
  const totalRevenue = salesData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
  const totalDeals = salesData.reduce((sum, item) => sum + item.deals, 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-gray-600">Manage your customers and grow your business</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="sales">Sales Pipeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{customersLoading ? 'Loading...' : totalCustomers}</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {activeCustomers} active
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{salesLoading ? 'Loading...' : `$${totalRevenue.toLocaleString()}`}</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {totalDeals} total deals
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">24.8%</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    3% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Deals</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">87</div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    15% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Customer Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Last Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-medium">${customer.value}</td>
                          <td className="py-4 px-4 text-gray-600">{customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'Never'}</td>
                          <td className="py-4 px-4">
                            <Button variant="outline" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deals" fill="#3b82f6" name="Deals Closed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deal Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pipelineData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-gray-600">{item.value} deals</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
