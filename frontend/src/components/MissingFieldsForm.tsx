import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MissingFieldsFormProps = {
  fieldName: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
};

export function MissingFieldsForm({
  fieldName,
  inputValue,
  onInputChange,
  onSubmit,
}: MissingFieldsFormProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-90px)] w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Card className="p-6 max-w-md w-full shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              Welcome to Your Interview
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="mb-4 text-gray-700 text-center">
              Please provide your{" "}
              <span className="font-medium text-black">{fieldName}</span>:
            </p>

            <div className="space-y-4">
              <Textarea
                className="w-full h-24 resize-none rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter your ${fieldName}...`}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
              />
              <Button
                className="w-full rounded-lg text-base font-medium"
                onClick={onSubmit}
                disabled={!inputValue.trim()}
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
