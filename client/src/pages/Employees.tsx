import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
  pin: string;
  rfid_code: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    pin: '',
    rfid_code: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier',
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(formData)
          .eq('id', editingEmployee.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
      }
      
      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        pin: '',
        rfid_code: '',
        role: 'cashier',
        is_active: true,
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      pin: employee.pin,
      rfid_code: employee.rfid_code || '',
      role: employee.role as 'admin' | 'manager' | 'cashier',
      is_active: employee.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary">Manager</Badge>;
      case 'cashier':
        return <Badge variant="outline">Cashier</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading employees...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your fuel station staff
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEmployee(null);
                setFormData({
                  full_name: '',
                  pin: '',
                  rfid_code: '',
                  role: 'cashier',
                  is_active: true,
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rfid_code">RFID Code (Optional)</Label>
                  <Input
                    id="rfid_code"
                    value={formData.rfid_code}
                    onChange={(e) => setFormData({ ...formData, rfid_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: 'admin' | 'manager' | 'cashier') => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingEmployee ? 'Update' : 'Create'} Employee
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employees List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No employees found matching your search.
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          RFID: {employee.rfid_code || 'Not set'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(employee.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(employee.role)}
                      <Badge variant={employee.is_active ? "default" : "secondary"}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Employees;