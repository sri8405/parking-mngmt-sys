import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Users, RefreshCw, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ParkingDataManager, { Slot, Session } from '@/components/ParkingData';

const LiveStatus = () => {
  const navigate = useNavigate();
  const dataManager = ParkingDataManager.getInstance();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const allSlots = dataManager.getSlots();
    const allSessions = dataManager.getSessions();
    
    setSlots(allSlots);
    setSessions(allSessions);
    setLastUpdated(new Date());
  };

  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slot.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || slot.location.building === buildingFilter;
    
    return matchesSearch && matchesStatus && matchesBuilding;
  });

  const getSlotStatusBadge = (status: string) => {
    switch (status) {
      case 'Free':
        return <Badge className="status-free">Free</Badge>;
      case 'Occupied':
        return <Badge className="status-occupied">Occupied</Badge>;
      case 'Reserved':
        return <Badge className="status-reserved">Reserved</Badge>;
      case 'Maintenance':
        return <Badge variant="secondary">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOccupancyDuration = (slotId: string) => {
    const session = sessions.find(s => s.slotId === slotId && s.status === 'entered');
    if (!session || !session.entryTime) return null;
    
    const duration = Date.now() - new Date(session.entryTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getUserForSlot = (slotId: string) => {
    const session = sessions.find(s => s.slotId === slotId && s.status === 'entered');
    if (!session) return null;
    
    return dataManager.getUserByVehicle(session.vehicleId);
  };

  const stats = {
    total: slots.length,
    free: slots.filter(s => s.status === 'Free').length,
    occupied: slots.filter(s => s.status === 'Occupied').length,
    reserved: slots.filter(s => s.status === 'Reserved').length,
    maintenance: slots.filter(s => s.status === 'Maintenance').length
  };

  return (
    <div className="min-h-screen bg-gradient-secondary section-padding">
      <div className="container-corporate">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Live Parking Status</h1>
            <p className="text-muted-foreground">Real-time monitoring of all parking slots</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="card-stat">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Slots</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-stat border-l-4 border-l-success">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{stats.free}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-stat border-l-4 border-l-destructive">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{stats.occupied}</p>
                <p className="text-xs text-muted-foreground">Occupied</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-stat border-l-4 border-l-warning">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{stats.reserved}</p>
                <p className="text-xs text-muted-foreground">Reserved</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-stat border-l-4 border-l-muted">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{stats.maintenance}</p>
                <p className="text-xs text-muted-foreground">Maintenance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-corporate mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Slots</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Slot ID or Vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Building</label>
                <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    <SelectItem value="A">Building A</SelectItem>
                    <SelectItem value="B">Building B</SelectItem>
                    <SelectItem value="C">Building C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setBuildingFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => {
            const duration = getOccupancyDuration(slot.id);
            const user = getUserForSlot(slot.id);
            
            return (
              <Card key={slot.id} className="card-corporate hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{slot.id}</CardTitle>
                    {getSlotStatusBadge(slot.status)}
                  </div>
                  <CardDescription>
                    {slot.location.building} - Floor {slot.location.floor} - {slot.location.zone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{slot.type}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Features:</span>
                      <div className="flex gap-1">
                        {slot.covered && <Badge variant="secondary" className="text-xs">Covered</Badge>}
                        {slot.accessible && <Badge variant="secondary" className="text-xs">Accessible</Badge>}
                      </div>
                    </div>
                    
                    {slot.status === 'Occupied' && user && (
                      <>
                        <div className="border-t pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="h-4 w-4 text-primary" />
                            <span className="font-medium">{slot.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{user.name}</span>
                          </div>
                          {duration && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Duration:</span>
                              <Badge variant="outline">{duration}</Badge>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    {slot.status === 'Reserved' && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium">{slot.assignedTo}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reserved for entry confirmation
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Usage: {slot.usageCount}</span>
                      <span>{slot.maintenanceStatus}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredSlots.length === 0 && (
          <Card className="card-corporate">
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No slots found</h3>
              <p className="text-muted-foreground">
                No parking slots match your current filters. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveStatus;