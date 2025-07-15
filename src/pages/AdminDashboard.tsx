import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Car, Activity, BarChart3, Settings, 
  LogOut, AlertTriangle, CheckCircle, Clock, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import ParkingDataManager, { Admin as AdminType } from '@/components/ParkingData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dataManager = ParkingDataManager.getInstance();
  const [admin, setAdmin] = useState<AdminType | null>(null);
  const [stats, setStats] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
    availableSlots: 0,
    queueLength: 0,
    activeUsers: 0,
    todayEntries: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    // Check admin authentication
    const session = localStorage.getItem('adminSession');
    if (!session) {
      navigate('/admin-auth');
      return;
    }

    const sessionData = JSON.parse(session);
    const adminData = dataManager.getAdminByEmail(sessionData.email);
    
    if (!adminData || adminData.status !== 'approved') {
      localStorage.removeItem('adminSession');
      navigate('/admin-auth');
      return;
    }

    setAdmin(adminData);
    
    // Load statistics
    const systemStats = dataManager.getStatistics();
    setStats(systemStats);

    // Update stats every 5 seconds
    const interval = setInterval(() => {
      const updatedStats = dataManager.getStatistics();
      setStats(updatedStats);
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate, dataManager]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast({
      title: "Admin Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/');
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container-corporate section-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System monitoring and management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-2" />
              {admin.accessLevel.toUpperCase()}
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-stat border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Car className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-3xl font-bold">{stats.totalSlots}</p>
                  <p className="text-sm text-muted-foreground">Parking spaces</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-success mr-3" />
                <div>
                  <p className="text-3xl font-bold">{stats.availableSlots}</p>
                  <p className="text-sm text-muted-foreground">Free slots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-destructive mr-3" />
                <div>
                  <p className="text-3xl font-bold">{stats.occupiedSlots}</p>
                  <p className="text-sm text-muted-foreground">{stats.occupancyRate.toFixed(1)}% full</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-warning mr-3" />
                <div>
                  <p className="text-3xl font-bold">{stats.queueLength}</p>
                  <p className="text-sm text-muted-foreground">Waiting vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-feature group cursor-pointer" onClick={() => navigate('/live-status')}>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Activity className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle>Live Monitoring</CardTitle>
              <CardDescription>
                Real-time slot status and vehicle tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-primary w-full">
                View Live Status
              </Button>
            </CardContent>
          </Card>

          <Card className="card-feature group cursor-pointer" onClick={() => navigate('/queue-status')}>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle>Queue Management</CardTitle>
              <CardDescription>
                Monitor waiting queue and manage overflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-primary w-full">
                Manage Queue
              </Button>
            </CardContent>
          </Card>

          <Card className="card-feature group cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Usage patterns and system insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-primary w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="card-corporate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-3 w-3 bg-success rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">System Online</span>
                </div>
                <p className="text-sm text-muted-foreground">All services operational</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium">Real-time Sync</span>
                </div>
                <p className="text-sm text-muted-foreground">Data updated live</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-4 w-4 text-success mr-2" />
                  <span className="font-medium">Secure Access</span>
                </div>
                <p className="text-sm text-muted-foreground">All connections encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;