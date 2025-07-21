import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, QrCode, Users, BarChart3, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

const Index = () => {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: QrCode,
      title: 'QR Payment Processing',
      description: 'Accept payments via QR codes and digital wallets',
      action: () => setLocation('/qr-payments'),
    },
    {
      icon: Fuel,
      title: 'Fuel Management',
      description: 'Track fuel types, prices, and inventory',
      action: () => setLocation('/fuel-types'),
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage staff roles and permissions',
      action: () => setLocation('/employees'),
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive business insights',
      action: () => setLocation('/reports'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Fuel className="h-16 w-16 text-fuel-station mr-4" />
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-fuel-station to-primary bg-clip-text text-transparent">
                FuelStation
              </h1>
              <p className="text-xl text-muted-foreground">QR Payment System</p>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Modern fuel station management with seamless QR code payments, 
            employee management, and real-time analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/dashboard')}
              className="bg-fuel-station hover:bg-fuel-station/90 text-fuel-station-foreground"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => setLocation('/qr-payments')}>
              Start QR Payment
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={feature.action}>
              <CardHeader>
                <feature.icon className="h-8 w-8 text-fuel-station mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-fuel-station">99.9%</div>
                <p className="text-muted-foreground">Uptime</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success">Secure</div>
                <p className="text-muted-foreground">Payments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <p className="text-muted-foreground">Support</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
