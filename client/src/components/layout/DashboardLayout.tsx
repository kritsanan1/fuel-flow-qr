import { ReactNode } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, Users, Receipt, BarChart3, QrCode, Settings, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { icon: Receipt, label: 'Transactions', path: '/transactions' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Fuel, label: 'Fuel Types', path: '/fuel-types' },
    { icon: QrCode, label: 'QR Payments', path: '/qr-payments' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Fuel className="h-8 w-8 text-fuel-station" />
            <div>
              <h1 className="text-lg font-bold text-fuel-station">FuelStation</h1>
              <p className="text-sm text-muted-foreground">QR Payment System</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => handleNavigation(item.path)}
                  isActive={location === item.path}
                  className="w-full justify-start"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h2 className="text-lg font-semibold">Fuel Station Management</h2>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;