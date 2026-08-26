export interface MockProfile {
  id: number;
  name: string;
  dob: string;
  pan: string;
  aadhaar: string;
  vehicleNo: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const MOCK_PROFILES: MockProfile[] = [
  {
    id: 1,
    name: "Ramesh Sharma",
    dob: "1990-05-15",
    pan: "ABCDE1234F",
    aadhaar: "[Aadhaar Redacted]",
    vehicleNo: "DL01AB1234",
    address: "B-42, Janakpuri, New Delhi, 110058",
    phone: "+91 98765 43210",
    email: "ramesh.sharma@example.gov.in"
  },
  {
    id: 2,
    name: "Priya Patel",
    dob: "1988-10-22",
    pan: "PKYUT9988C",
    aadhaar: "[Aadhaar Redacted]",
    vehicleNo: "MH02CD5678",
    address: "Flat 304, Green Palms, Andheri East, Mumbai, 400069",
    phone: "+91 91234 56789",
    email: "priya.patel@example.gov.in"
  }
];
