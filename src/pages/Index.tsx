import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Clock, Shield, QrCode, Activity, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ParkingDataManager from '@/components/ParkingData';

const Index = () => {
  const navigate = useNavigate();
  const dataManager = ParkingDataManager.getInstance();
  const [stats, setStats] = useState({
    totalSlots: 150,
    occupiedSlots: 87,
    availableSlots: 63,
    queueLength: 5,
    activeUsers: 142,
    todayEntries: 89
  });

  // Initialize data and get real stats
  useEffect(() => {
    dataManager.initializeData();
    const realStats = dataManager.getStatistics();
    setStats(realStats);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const updatedStats = dataManager.getStatistics();
      setStats(prev => ({
        ...updatedStats,
        // Add some realistic fluctuation
        occupiedSlots: Math.max(0, Math.min(updatedStats.totalSlots, updatedStats.occupiedSlots + (Math.random() > 0.5 ? 1 : -1))),
        queueLength: Math.max(0, updatedStats.queueLength + (Math.random() > 0.7 ? 1 : -1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const occupancyRate = ((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-corporate">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <Car className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SmartPark Pro
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Professional QR-based parking management system with real-time tracking, 
              queue management, and comprehensive analytics for modern offices.
            </p>
            
            {/* Live Status Badge */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-lg">
                <Activity className="h-4 w-4 mr-2 text-success animate-pulse" />
                System Online
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-lg">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Real-time Monitoring
              </Badge>
            </div>
          </div>

          {/* Live Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
            <Card className="card-stat border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-success">{stats.availableSlots}</span>
                  <Badge className="ml-2 status-free">{((stats.availableSlots / stats.totalSlots) * 100).toFixed(0)}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Occupied Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-destructive">{stats.occupiedSlots}</span>
                  <Badge className="ml-2 status-occupied">{occupancyRate}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-warning">{stats.queueLength}</span>
                  <Badge className="ml-2 status-reserved">Waiting</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary">{stats.activeUsers}</span>
                  <Badge variant="outline" className="ml-2">Online</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Authentication Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-scale-in">
            <Card className="card-feature group cursor-pointer" onClick={() => navigate('/employee-auth')}>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Users className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-200" />
                </div>
                <CardTitle className="text-2xl">Employee Portal</CardTitle>
                <CardDescription className="text-lg">
                  Access parking slots, scan QR codes, and manage your parking sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="btn-primary w-full text-lg py-3">
                  Employee Login / Register
                </Button>
                <div className="mt-4 flex justify-around text-sm text-muted-foreground">
                  <span className="flex items-center"><QrCode className="h-4 w-4 mr-1" /> QR Scanning</span>
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Time Tracking</span>
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Slot Finder</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-feature group cursor-pointer" onClick={() => navigate('/admin-auth')}>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-200" />
                </div>
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription className="text-lg">
                  Monitor parking operations, manage users, and access analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="btn-primary w-full text-lg py-3">
                  Admin Login / Register
                </Button>
                <div className="mt-4 flex justify-around text-sm text-muted-foreground">
                  <span className="flex items-center"><Activity className="h-4 w-4 mr-1" /> Live Monitor</span>
                  <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> User Mgmt</span>
                  <span className="flex items-center"><Building className="h-4 w-4 mr-1" /> Analytics</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Features */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-6">Advanced Parking Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-corporate p-6">
                <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">QR-Based Entry/Exit</h3>
                <p className="text-muted-foreground">Contactless parking with secure QR code authentication and OTP verification</p>
              </Card>
              
              <Card className="card-corporate p-6">
                <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-muted-foreground">Live slot status, queue management, and comprehensive activity tracking</p>
              </Card>
              
              <Card className="card-corporate p-6">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
                <p className="text-muted-foreground">Duration tracking, usage patterns, and predictive parking insights</p>
              </Card>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/qr-generator')}>
                QR Generator
              </Button>
              <Button variant="outline" onClick={() => navigate('/live-status')}>
                Live Status
              </Button>
              <Button variant="outline" onClick={() => navigate('/queue-status')}>
                Queue Monitor
              </Button>
              <Button variant="outline" onClick={() => navigate('/about')}>
                System Info
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
