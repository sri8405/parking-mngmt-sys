import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Car, AlertCircle, RefreshCw, Crown, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ParkingDataManager, { QueueEntry } from '@/components/ParkingData';

const QueueStatus = () => {
  const navigate = useNavigate();
  const dataManager = ParkingDataManager.getInstance();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadQueueData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadQueueData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadQueueData = () => {
    const currentQueue = dataManager.getQueue();
    setQueue(currentQueue);
    setLastUpdated(new Date());
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'disabled':
        return <Accessibility className="h-4 w-4 text-primary" />;
      case 'vip':
        return <Crown className="h-4 w-4 text-warning" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge className="status-occupied">Emergency</Badge>;
      case 'disabled':
        return <Badge className="bg-primary text-primary-foreground">Accessibility</Badge>;
      case 'vip':
        return <Badge className="status-warning">VIP</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getUserForEntry = (entry: QueueEntry) => {
    return dataManager.getUsers().find(user => user.id === entry.userId);
  };

  const stats = {
    total: queue.length,
    emergency: queue.filter(q => q.priority === 'emergency').length,
    disabled: queue.filter(q => q.priority === 'disabled').length,
    vip: queue.filter(q => q.priority === 'vip').length,
    normal: queue.filter(q => q.priority === 'normal').length,
    avgWaitTime: queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + q.estimatedWait, 0) / queue.length) : 0
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
            <h1 className="text-3xl font-bold">Parking Queue Status</h1>
            <p className="text-muted-foreground">Monitor waiting queue and manage overflow situations</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button variant="outline" size="sm" onClick={loadQueueData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="card-stat border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total in Queue</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-destructive">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{stats.emergency}</p>
                <p className="text-xs text-muted-foreground">Emergency</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.disabled}</p>
                <p className="text-xs text-muted-foreground">Accessibility</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-warning">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{stats.vip}</p>
                <p className="text-xs text-muted-foreground">VIP</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-muted">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{stats.normal}</p>
                <p className="text-xs text-muted-foreground">Normal</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat border-l-4 border-l-success">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{stats.avgWaitTime}</p>
                <p className="text-xs text-muted-foreground">Avg Wait (min)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue List */}
        {queue.length === 0 ? (
          <Card className="card-corporate">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles in queue</h3>
              <p className="text-muted-foreground">
                All parking slots are available. Queue is empty.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="card-corporate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Queue ({queue.length} vehicles)
                </CardTitle>
                <CardDescription>
                  Vehicles waiting for available parking slots, sorted by priority
                </CardDescription>
              </CardHeader>
            </Card>

            {queue.map((entry, index) => {
              const user = getUserForEntry(entry);
              const waitTime = Math.floor((Date.now() - new Date(entry.queueTime).getTime()) / (1000 * 60));
              
              return (
                <Card key={entry.id} className="card-corporate hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Position Number */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {entry.position}
                        </div>
                        
                        {/* Vehicle and User Info */}
                        <div>
                          <div className="flex items-center gap-3">
                            <Car className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">{entry.vehicleId}</span>
                            {getPriorityIcon(entry.priority)}
                            {getPriorityBadge(entry.priority)}
                          </div>
                          {user && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {user.name} • {user.department} • {user.designation}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Timing Info */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            Est. {entry.estimatedWait} min wait
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Waiting for {waitTime} minutes
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Since {new Date(entry.queueTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        {entry.slotPreference && entry.slotPreference !== 'any' && (
                          <span className="text-muted-foreground">
                            Prefers: <Badge variant="outline">{entry.slotPreference}</Badge>
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          Notified: {entry.notified ? 
                            <Badge className="status-free">Yes</Badge> : 
                            <Badge variant="outline">No</Badge>
                          }
                        </span>
                      </div>
                      
                      {/* Admin Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Notify User
                        </Button>
                        <Button variant="outline" size="sm">
                          Priority Boost
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Queue Management Info */}
        <Card className="card-corporate mt-8">
          <CardHeader>
            <CardTitle>Queue Management Information</CardTitle>
            <CardDescription>
              How the parking queue system works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Priority Order</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">1. Emergency vehicles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Accessibility className="h-4 w-4 text-primary" />
                    <span className="text-sm">2. Accessibility needs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-warning" />
                    <span className="text-sm">3. VIP users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">4. Normal users (FIFO)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Automatic Processing</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Users are automatically notified when slots become available</p>
                  <p>• 5-minute response window for slot confirmation</p>
                  <p>• Queue position updates in real-time</p>
                  <p>• Estimated wait times based on current conditions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueueStatus;