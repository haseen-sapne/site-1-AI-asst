import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ChallanCard({ result }: { result: any }) {
  if (result.status === 'NOT_FOUND') {
    return (
      <Card className="bg-green-50 border-green-200 mt-2">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
          <p className="text-sm font-medium text-green-800">{result.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-2 border-red-200 shadow-sm">
      <CardHeader className="bg-red-50/50 pb-3 border-b">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-red-700">e-Challan Pending</CardTitle>
          <Badge variant="destructive">₹{result.amount}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2 text-sm">
        <div className="flex justify-between border-b pb-1">
          <span className="text-gray-500">Vehicle No:</span>
          <span className="font-semibold uppercase">{result.vehicle}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="text-gray-500">Challan ID:</span>
          <span>{result.challanId}</span>
        </div>
        <div className="flex justify-between border-b pb-1">
          <span className="text-gray-500">Violation:</span>
          <span>{result.offense}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-gray-500">Date:</span>
          <span>{result.date}</span>
        </div>
        <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium transition-colors">
          Proceed to Secure Payment
        </button>
      </CardContent>
    </Card>
  );
}