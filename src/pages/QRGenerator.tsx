import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, RefreshCw, Download, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ParkingSystem from '@/components/ParkingSystem';

const QRGenerator = () => {
  const navigate = useNavigate();
  const parkingSystem = ParkingSystem.getInstance();
  const [entryQR, setEntryQR] = useState({ qrCode: '', data: null as any, validityTime: 5 });
  const [exitQR, setExitQR] = useState({ qrCode: '', data: null as any, validityTime: 5 });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Generate initial QR codes
    generateQRCodes();

    // Auto-refresh every 3 minutes
    const interval = setInterval(() => {
      generateQRCodes();
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const generateQRCodes = () => {
    const newEntryQR = parkingSystem.generateEntryQR('GATE_01');
    const newExitQR = parkingSystem.generateExitQR('GATE_01');
    
    setEntryQR(newEntryQR);
    setExitQR(newExitQR);
    setLastUpdated(new Date());
  };

  const downloadQR = (qrData: string, filename: string) => {
    // In a real application, this would generate and download an actual QR code image
    const element = document.createElement('a');
    const file = new Blob([qrData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary section-padding">
      <div className="container-corporate max-w-4xl">
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
          <div>
            <h1 className="text-3xl font-bold">QR Code Generator</h1>
            <p className="text-muted-foreground">Hardware device QR code generation and management</p>
          </div>
        </div>

        {/* Status Bar */}
        <Card className="card-corporate mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-3 py-1">
                  <Monitor className="h-4 w-4 mr-2" />
                  Hardware Simulation
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={generateQRCodes}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh QR Codes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entry Gate QR */}
          <Card className="card-corporate">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-6 w-6 text-success" />
                Entry Gate QR
              </CardTitle>
              <CardDescription>
                Scan this QR code to request parking slot entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* QR Code Display Area */}
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-success">
                  <div className="bg-black text-white p-6 rounded font-mono text-xs break-all">
                    {entryQR.qrCode.substring(0, 100)}...
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    QR Code Data (truncated for display)
                  </p>
                </div>

                {/* QR Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gate ID:</span>
                    <Badge variant="outline">GATE_01</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Validity:</span>
                    <Badge className="status-free">{entryQR.validityTime} minutes</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Action:</span>
                    <Badge variant="outline">Entry Request</Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => downloadQR(entryQR.qrCode, 'entry-qr.txt')}
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    In production, this would be displayed on hardware device
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exit Gate QR */}
          <Card className="card-corporate">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-6 w-6 text-warning" />
                Exit Gate QR
              </CardTitle>
              <CardDescription>
                Scan this QR code to process parking exit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* QR Code Display Area */}
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-warning">
                  <div className="bg-black text-white p-6 rounded font-mono text-xs break-all">
                    {exitQR.qrCode.substring(0, 100)}...
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    QR Code Data (truncated for display)
                  </p>
                </div>

                {/* QR Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Gate ID:</span>
                    <Badge variant="outline">GATE_01</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Validity:</span>
                    <Badge className="status-warning">{exitQR.validityTime} minutes</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Action:</span>
                    <Badge variant="outline">Exit Process</Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => downloadQR(exitQR.qrCode, 'exit-qr.txt')}
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    In production, this would be displayed on hardware device
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hardware Instructions */}
        <Card className="card-corporate mt-8">
          <CardHeader>
            <CardTitle>Hardware Integration Guide</CardTitle>
            <CardDescription>
              Instructions for implementing QR code generation on physical devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Entry Gate Device</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Position QR display at driver eye level</li>
                    <li>• Auto-refresh every 3 minutes</li>
                    <li>• Include validity countdown timer</li>
                    <li>• Backup manual entry keypad</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Exit Gate Device</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Synchronized with entry gate timing</li>
                    <li>• Clear "EXIT" signage</li>
                    <li>• OTP input capability</li>
                    <li>• Emergency override access</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Technical Requirements:</strong> QR codes use JSON format with timestamp validation, 
                  secure hash verification, and 5-minute expiry for optimal security and user experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRGenerator;