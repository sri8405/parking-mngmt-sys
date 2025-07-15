import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, QrCode, Clock, MapPin, LogOut, User, History, 
  Timer, AlertCircle, CheckCircle, Camera, Key, Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import ParkingDataManager, { User as UserType, Session } from '@/components/ParkingData';
import ParkingSystem from '@/components/ParkingSystem';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const dataManager = ParkingDataManager.getInstance();
  const parkingSystem = ParkingSystem.getInstance();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrScanMode, setQrScanMode] = useState<'entry' | 'exit' | null>(null);
  const [entryForm, setEntryForm] = useState({ vehicleId: '', scannedQR: '' });
  const [exitForm, setExitForm] = useState({ vehicleId: '', otp: '', scannedQR: '' });
  const [parkingDuration, setParkingDuration] = useState<string>('');

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('userSession');
    if (!session) {
      navigate('/employee-auth');
      return;
    }

    const sessionData = JSON.parse(session);
    const userData = dataManager.getUserByEmail(sessionData.email);
    
    if (!userData) {
      localStorage.removeItem('userSession');
      navigate('/employee-auth');
      return;
    }

    setUser(userData);
    setEntryForm(prev => ({ ...prev, vehicleId: userData.vehicleNo }));
    setExitForm(prev => ({ ...prev, vehicleId: userData.vehicleNo }));

    // Check for active session
    const activeSession = parkingSystem.getCurrentSession(userData.vehicleNo);
    setCurrentSession(activeSession);

    // Update parking duration if vehicle is parked
    if (activeSession && activeSession.status === 'entered' && activeSession.entryTime) {
      const updateDuration = () => {
        const duration = Date.now() - new Date(activeSession.entryTime!).getTime();
        setParkingDuration(parkingSystem.formatDuration(duration));
      };
      
      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [navigate, dataManager, parkingSystem]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/');
  };

  const simulateQRScan = (type: 'entry' | 'exit') => {
    // Simulate QR code scanning
    const qrData = type === 'entry' 
      ? parkingSystem.generateEntryQR()
      : parkingSystem.generateExitQR();
    
    if (type === 'entry') {
      setEntryForm(prev => ({ ...prev, scannedQR: qrData.qrCode }));
    } else {
      setExitForm(prev => ({ ...prev, scannedQR: qrData.qrCode }));
    }
    
    toast({
      title: "QR Code Scanned",
      description: `${type === 'entry' ? 'Entry' : 'Exit'} QR code scanned successfully`
    });
  };

  const handleEntry = async () => {
    if (!entryForm.scannedQR) {
      toast({
        variant: "destructive",
        title: "Scan Required",
        description: "Please scan the entry QR code first"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = parkingSystem.processVehicleEntry(entryForm.scannedQR, entryForm.vehicleId);
      
      if (result.success) {
        if ('queued' in result && result.queued) {
          toast({
            title: "Added to Queue",
            description: result.message
          });
        } else if ('slot' in result && result.slot) {
          toast({
            title: "Slot Assigned",
            description: result.message
          });
          
          // Show slot assignment details
          setTimeout(() => {
            const confirmResult = parkingSystem.confirmParking(
              entryForm.vehicleId, 
              result.slot, 
              result.otp
            );
            
            if (confirmResult.success) {
              toast({
                title: "Parking Confirmed",
                description: confirmResult.message
              });
              
              // Update current session
              const newSession = parkingSystem.getCurrentSession(entryForm.vehicleId);
              setCurrentSession(newSession);
            }
          }, 2000); // Simulate user walking to slot and confirming
        }
      } else {
        toast({
          variant: "destructive",
          title: "Entry Failed",
          description: result.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during entry process"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = async () => {
    if (!exitForm.scannedQR || !exitForm.otp) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please scan exit QR code and enter OTP"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = parkingSystem.processVehicleExit(
        exitForm.scannedQR, 
        exitForm.vehicleId, 
        exitForm.otp
      );
      
      if (result.success) {
        toast({
          title: "Exit Processing",
          description: result.message
        });
        
        // Update session after exit completes
        setTimeout(() => {
          const updatedSession = parkingSystem.getCurrentSession(exitForm.vehicleId);
          setCurrentSession(updatedSession);
          setParkingDuration('');
          
          toast({
            title: "Exit Completed",
            description: `Total parking time: ${result.duration?.formatted}`
          });
        }, 10000);
      } else {
        toast({
          variant: "destructive",
          title: "Exit Failed",
          description: result.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during exit process"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isParkingActive = currentSession && currentSession.status === 'entered';
  const slotInfo = isParkingActive ? parkingSystem.getSlotById(currentSession.slotId) : null;

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container-corporate section-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Car className="h-4 w-4 mr-2" />
              {user.vehicleNo}
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className={`card-stat border-l-4 ${isParkingActive ? 'border-l-success' : 'border-l-muted'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {isParkingActive ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-success mr-3" />
                    <div>
                      <p className="text-lg font-semibold text-success">Parked</p>
                      <p className="text-sm text-muted-foreground">Slot {currentSession.slotId}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-8 w-8 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-lg font-semibold text-muted-foreground">Not Parked</p>
                      <p className="text-sm text-muted-foreground">Ready for parking</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {isParkingActive && (
            <>
              <Card className="card-stat border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Parking Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Timer className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{parkingDuration}</p>
                      <p className="text-sm text-muted-foreground">Live tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-stat border-l-4 border-l-warning">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Slot Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <MapPin className="h-8 w-8 text-warning mr-3" />
                    <div>
                      <p className="text-lg font-semibold">{currentSession.slotId}</p>
                      <p className="text-sm text-muted-foreground">
                        {slotInfo?.location.building} - Floor {slotInfo?.location.floor}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Actions */}
        <Card className="card-corporate mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Parking Operations
            </CardTitle>
            <CardDescription>
              Scan QR codes to enter or exit parking areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={isParkingActive ? "exit" : "entry"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entry" disabled={isParkingActive}>
                  Entry Process
                </TabsTrigger>
                <TabsTrigger value="exit" disabled={!isParkingActive}>
                  Exit Process
                </TabsTrigger>
              </TabsList>

              {/* Entry Tab */}
              <TabsContent value="entry" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Scan Entry QR Code</h3>
                    <p className="text-muted-foreground mb-4">
                      Position your camera over the QR code at the entry gate
                    </p>
                    <Button 
                      onClick={() => simulateQRScan('entry')}
                      className="btn-primary"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Simulate QR Scan
                    </Button>
                  </div>

                  {entryForm.scannedQR && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span>QR Code Scanned Successfully</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="entry-vehicle">Vehicle Number</Label>
                        <Input
                          id="entry-vehicle"
                          value={entryForm.vehicleId}
                          readOnly
                          className="input-corporate bg-muted"
                        />
                      </div>

                      <Button 
                        onClick={handleEntry}
                        disabled={isLoading}
                        className="btn-success w-full"
                      >
                        {isLoading ? 'Processing Entry...' : 'Request Parking Slot'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Exit Tab */}
              <TabsContent value="exit" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Scan Exit QR Code</h3>
                    <p className="text-muted-foreground mb-4">
                      Position your camera over the QR code at the exit gate
                    </p>
                    <Button 
                      onClick={() => simulateQRScan('exit')}
                      className="btn-primary"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Simulate QR Scan
                    </Button>
                  </div>

                  {exitForm.scannedQR && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span>Exit QR Code Scanned</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exit-vehicle">Vehicle Number</Label>
                          <Input
                            id="exit-vehicle"
                            value={exitForm.vehicleId}
                            readOnly
                            className="input-corporate bg-muted"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="exit-otp">Entry OTP</Label>
                          <Input
                            id="exit-otp"
                            placeholder="Enter your entry OTP"
                            value={exitForm.otp}
                            onChange={(e) => setExitForm(prev => ({ ...prev, otp: e.target.value }))}
                            className="input-corporate"
                          />
                          {currentSession && (
                            <p className="text-xs text-muted-foreground">
                              OTP: {currentSession.otp} (for demo)
                            </p>
                          )}
                        </div>
                      </div>

                      <Button 
                        onClick={handleExit}
                        disabled={isLoading || !exitForm.otp}
                        className="btn-warning w-full"
                      >
                        {isLoading ? 'Processing Exit...' : 'Process Exit'}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-corporate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Parking Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold">{Math.floor(user.totalParkingTime / 60)}h</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-corporate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-destructive mr-3" />
                <div>
                  <p className="text-2xl font-bold">{user.violations}</p>
                  <p className="text-sm text-muted-foreground">Total violations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-corporate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Parked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <History className="h-8 w-8 text-muted-foreground mr-3" />
                <div>
                  <p className="text-lg font-semibold">
                    {user.lastParked ? new Date(user.lastParked).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-sm text-muted-foreground">Last parking date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;