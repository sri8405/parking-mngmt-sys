import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, Building, Eye, EyeOff, UserPlus, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import ParkingDataManager, { Admin as AdminType } from '@/components/ParkingData';

const AdminAuth = () => {
  const navigate = useNavigate();
  const dataManager = ParkingDataManager.getInstance();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Registration Form State
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    adminId: '',
    email: '',
    phone: '',
    designation: '',
    department: 'IT',
    accessLevel: 'level1' as 'level1' | 'level2' | 'super_admin',
    password: '',
    confirmPassword: '',
    
    // Permissions
    userManagement: true,
    slotManagement: true,
    systemSettings: false,
    reports: true,
    securityMonitoring: true,
    emergencyOverride: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const admin = dataManager.getAdminByEmail(loginForm.email);
      
      if (!admin) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "No admin account found with this email address."
        });
        return;
      }

      if (admin.password !== loginForm.password) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid password. Please try again."
        });
        return;
      }

      if (admin.status !== 'approved') {
        toast({
          variant: "destructive",
          title: "Account Pending",
          description: "Your admin account is pending approval. Contact super admin."
        });
        return;
      }

      // Create session
      const session = {
        userId: admin.id,
        email: admin.email,
        role: 'admin',
        accessLevel: admin.accessLevel,
        permissions: admin.permissions,
        loginTime: new Date(),
        sessionId: Date.now().toString()
      };

      localStorage.setItem('adminSession', JSON.stringify(session));
      
      toast({
        title: "Admin Login Successful",
        description: `Welcome back, ${admin.name}!`
      });

      navigate('/admin-dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (signupForm.password !== signupForm.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Passwords do not match."
        });
        return;
      }

      if (signupForm.password.length < 8) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Admin password must be at least 8 characters long."
        });
        return;
      }

      // Check if email already exists
      if (dataManager.getAdminByEmail(signupForm.email)) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An admin account with this email already exists."
        });
        return;
      }

      // Create new admin
      const newAdmin: AdminType = {
        id: Date.now(),
        name: signupForm.fullName,
        adminId: signupForm.adminId,
        email: signupForm.email,
        phone: signupForm.phone,
        department: signupForm.department,
        designation: signupForm.designation,
        accessLevel: signupForm.accessLevel,
        permissions: {
          userManagement: signupForm.userManagement,
          slotManagement: signupForm.slotManagement,
          systemSettings: signupForm.systemSettings,
          reports: signupForm.reports,
          securityMonitoring: signupForm.securityMonitoring,
          emergencyOverride: signupForm.emergencyOverride
        },
        status: signupForm.accessLevel === 'super_admin' ? 'approved' : 'pending',
        password: signupForm.password,
        createdAt: new Date()
      };

      dataManager.addAdmin(newAdmin);

      if (newAdmin.status === 'pending') {
        toast({
          title: "Registration Submitted",
          description: "Your admin registration is pending approval. You will be notified once approved."
        });
      } else {
        toast({
          title: "Admin Account Created",
          description: "Your super admin account has been created successfully. Please login."
        });
      }

      setActiveTab('login');
      setSignupForm({
        fullName: '',
        adminId: '',
        email: '',
        phone: '',
        designation: '',
        department: 'IT',
        accessLevel: 'level1',
        password: '',
        confirmPassword: '',
        userManagement: true,
        slotManagement: true,
        systemSettings: false,
        reports: true,
        securityMonitoring: true,
        emergencyOverride: false
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "An error occurred during registration. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionDescription = (level: string) => {
    switch (level) {
      case 'level1':
        return 'Basic monitoring and user management';
      case 'level2':
        return 'Advanced slot management and reporting';
      case 'super_admin':
        return 'Full system control and emergency override';
      default:
        return '';
    }
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
            <h1 className="text-3xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground">Secure administrative access to parking management system</p>
          </div>
        </div>

        <Card className="card-corporate">
          <CardHeader>
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              SmartPark Pro Admin Portal
            </CardTitle>
            <CardDescription className="text-center">
              Administrative control panel for parking system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register Admin
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@company.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                      className="input-corporate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your admin password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                        className="input-corporate pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Authenticating...' : 'Admin Sign In'}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Demo Admin: admin@company.com / admin123
                </div>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Administrator Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-fullName">Full Name *</Label>
                        <Input
                          id="admin-fullName"
                          placeholder="John Admin"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-adminId">Admin ID *</Label>
                        <Input
                          id="admin-adminId"
                          placeholder="ADM001"
                          value={signupForm.adminId}
                          onChange={(e) => setSignupForm({...signupForm, adminId: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email Address *</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@company.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-phone">Phone Number *</Label>
                        <Input
                          id="admin-phone"
                          type="tel"
                          placeholder="+91-9876543220"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-designation">Designation *</Label>
                        <Input
                          id="admin-designation"
                          placeholder="System Administrator"
                          value={signupForm.designation}
                          onChange={(e) => setSignupForm({...signupForm, designation: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-department">Department *</Label>
                        <Select 
                          value={signupForm.department} 
                          onValueChange={(value) => setSignupForm({...signupForm, department: value})}
                        >
                          <SelectTrigger className="input-corporate">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Facilities">Facilities Management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Access Level */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Access Level</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-accessLevel">Administrative Level *</Label>
                      <Select 
                        value={signupForm.accessLevel} 
                        onValueChange={(value: 'level1' | 'level2' | 'super_admin') => {
                          setSignupForm({
                            ...signupForm, 
                            accessLevel: value,
                            // Auto-set permissions based on level
                            systemSettings: value === 'super_admin',
                            emergencyOverride: value === 'super_admin'
                          });
                        }}
                      >
                        <SelectTrigger className="input-corporate">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="level1">Level 1 - Basic Admin</SelectItem>
                          <SelectItem value="level2">Level 2 - Advanced Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {getPermissionDescription(signupForm.accessLevel)}
                      </p>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Permissions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="userManagement"
                          checked={signupForm.userManagement}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, userManagement: checked as boolean})}
                        />
                        <Label htmlFor="userManagement">User Management</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="slotManagement"
                          checked={signupForm.slotManagement}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, slotManagement: checked as boolean})}
                        />
                        <Label htmlFor="slotManagement">Slot Management</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="systemSettings"
                          checked={signupForm.systemSettings}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, systemSettings: checked as boolean})}
                          disabled={signupForm.accessLevel !== 'super_admin'}
                        />
                        <Label htmlFor="systemSettings">System Settings</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="reports"
                          checked={signupForm.reports}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, reports: checked as boolean})}
                        />
                        <Label htmlFor="reports">Reports & Analytics</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="securityMonitoring"
                          checked={signupForm.securityMonitoring}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, securityMonitoring: checked as boolean})}
                        />
                        <Label htmlFor="securityMonitoring">Security Monitoring</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="emergencyOverride"
                          checked={signupForm.emergencyOverride}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, emergencyOverride: checked as boolean})}
                          disabled={signupForm.accessLevel !== 'super_admin'}
                        />
                        <Label htmlFor="emergencyOverride">Emergency Override</Label>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password *</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-confirmPassword">Confirm Password *</Label>
                        <Input
                          id="admin-confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Admin registrations require approval from existing super administrators. 
                      You will be notified once your account is approved and activated.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting Registration...' : 'Register Admin Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;