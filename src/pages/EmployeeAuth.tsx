import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Car, Building, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import ParkingDataManager, { User as UserType } from '@/components/ParkingData';

const EmployeeAuth = () => {
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
    // Personal Information
    fullName: '',
    employeeId: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    building: '',
    floor: '',
    password: '',
    confirmPassword: '',
    
    // Vehicle Information
    vehicleNumber: '',
    vehicleType: '4W' as '2W' | '4W',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    
    // Preferences
    accessibilityNeeds: false,
    notifications: true,
    priorityType: 'normal' as 'normal' | 'vip' | 'disabled'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = dataManager.getUserByEmail(loginForm.email);
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "No account found with this email address."
        });
        return;
      }

      if (user.password !== loginForm.password) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid password. Please try again."
        });
        return;
      }

      if (!user.isActive) {
        toast({
          variant: "destructive",
          title: "Account Deactivated",
          description: "Your account has been deactivated. Contact admin."
        });
        return;
      }

      // Create session
      const session = {
        userId: user.id,
        email: user.email,
        role: 'employee',
        loginTime: new Date(),
        sessionId: Date.now().toString()
      };

      localStorage.setItem('userSession', JSON.stringify(session));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`
      });

      navigate('/employee-dashboard');
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

      if (signupForm.password.length < 6) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Password must be at least 6 characters long."
        });
        return;
      }

      // Check if email already exists
      if (dataManager.getUserByEmail(signupForm.email)) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An account with this email already exists."
        });
        return;
      }

      // Check if vehicle number already exists
      if (dataManager.getUserByVehicle(signupForm.vehicleNumber)) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "This vehicle number is already registered."
        });
        return;
      }

      // Create new user
      const newUser: UserType = {
        id: Date.now(),
        name: signupForm.fullName,
        employeeId: signupForm.employeeId,
        email: signupForm.email,
        phone: signupForm.phone,
        vehicleNo: signupForm.vehicleNumber,
        vehicleType: signupForm.vehicleType,
        vehicleBrand: signupForm.vehicleBrand,
        vehicleModel: signupForm.vehicleModel,
        vehicleColor: signupForm.vehicleColor,
        department: signupForm.department,
        building: signupForm.building,
        floor: parseInt(signupForm.floor),
        designation: signupForm.designation,
        priority: signupForm.priorityType,
        isActive: true,
        createdAt: new Date(),
        totalParkingTime: 0,
        violations: 0,
        preferredSlots: [],
        notifications: signupForm.notifications,
        accessibilityNeeds: signupForm.accessibilityNeeds,
        password: signupForm.password
      };

      dataManager.addUser(newUser);

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully. Please login."
      });

      setActiveTab('login');
      setSignupForm({
        fullName: '',
        employeeId: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        building: '',
        floor: '',
        password: '',
        confirmPassword: '',
        vehicleNumber: '',
        vehicleType: '4W',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleColor: '',
        accessibilityNeeds: false,
        notifications: true,
        priorityType: 'normal'
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
            <h1 className="text-3xl font-bold">Employee Access</h1>
            <p className="text-muted-foreground">Login or register to access the parking system</p>
          </div>
        </div>

        <Card className="card-corporate">
          <CardHeader>
            <CardTitle className="text-center text-2xl">SmartPark Pro Employee Portal</CardTitle>
            <CardDescription className="text-center">
              Secure access to parking management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                      className="input-corporate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  Demo Credentials: john.doe@company.com / password123
                </div>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID *</Label>
                        <Input
                          id="employeeId"
                          placeholder="EMP001"
                          value={signupForm.employeeId}
                          onChange={(e) => setSignupForm({...signupForm, employeeId: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@company.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91-9876543210"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation *</Label>
                        <Input
                          id="designation"
                          placeholder="Senior Engineer"
                          value={signupForm.designation}
                          onChange={(e) => setSignupForm({...signupForm, designation: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select 
                          value={signupForm.department} 
                          onValueChange={(value) => setSignupForm({...signupForm, department: value})}
                        >
                          <SelectTrigger className="input-corporate">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="IT">Information Technology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="building">Building *</Label>
                        <Select 
                          value={signupForm.building} 
                          onValueChange={(value) => setSignupForm({...signupForm, building: value})}
                        >
                          <SelectTrigger className="input-corporate">
                            <SelectValue placeholder="Select Building" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Building A</SelectItem>
                            <SelectItem value="B">Building B</SelectItem>
                            <SelectItem value="C">Building C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="floor">Floor *</Label>
                        <Select 
                          value={signupForm.floor} 
                          onValueChange={(value) => setSignupForm({...signupForm, floor: value})}
                        >
                          <SelectTrigger className="input-corporate">
                            <SelectValue placeholder="Select Floor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Floor 1</SelectItem>
                            <SelectItem value="2">Floor 2</SelectItem>
                            <SelectItem value="3">Floor 3</SelectItem>
                            <SelectItem value="4">Floor 4</SelectItem>
                            <SelectItem value="5">Floor 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Car className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Vehicle Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                        <Input
                          id="vehicleNumber"
                          placeholder="KA01AB1234"
                          value={signupForm.vehicleNumber}
                          onChange={(e) => setSignupForm({...signupForm, vehicleNumber: e.target.value.toUpperCase()})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleType">Vehicle Type *</Label>
                        <Select 
                          value={signupForm.vehicleType} 
                          onValueChange={(value: '2W' | '4W') => setSignupForm({...signupForm, vehicleType: value})}
                        >
                          <SelectTrigger className="input-corporate">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2W">Two Wheeler</SelectItem>
                            <SelectItem value="4W">Four Wheeler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
                        <Input
                          id="vehicleBrand"
                          placeholder="Toyota"
                          value={signupForm.vehicleBrand}
                          onChange={(e) => setSignupForm({...signupForm, vehicleBrand: e.target.value})}
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          placeholder="Innova"
                          value={signupForm.vehicleModel}
                          onChange={(e) => setSignupForm({...signupForm, vehicleModel: e.target.value})}
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleColor">Vehicle Color</Label>
                        <Input
                          id="vehicleColor"
                          placeholder="White"
                          value={signupForm.vehicleColor}
                          onChange={(e) => setSignupForm({...signupForm, vehicleColor: e.target.value})}
                          className="input-corporate"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                          required
                          className="input-corporate"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
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

                  {/* Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Preferences</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="accessibilityNeeds"
                          checked={signupForm.accessibilityNeeds}
                          onCheckedChange={(checked) => setSignupForm({
                            ...signupForm, 
                            accessibilityNeeds: checked as boolean,
                            priorityType: checked ? 'disabled' : 'normal'
                          })}
                        />
                        <Label htmlFor="accessibilityNeeds">I have accessibility needs (wheelchair accessible parking)</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="notifications"
                          checked={signupForm.notifications}
                          onCheckedChange={(checked) => setSignupForm({...signupForm, notifications: checked as boolean})}
                        />
                        <Label htmlFor="notifications">Enable email notifications</Label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
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

export default EmployeeAuth;