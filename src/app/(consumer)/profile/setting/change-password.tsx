import { PasswordInput } from "@/components/forms";
import { Button } from "@/components/ui/button";

export default function ChangePassword() {
  return (
    <form>
      <div className="grid grid-cols-12 mt-4 mb-5">
        <div className="col-span-8">
          <PasswordInput
            label="Old password"
            autoComplete="old-password"
            placeholder="Enter new password "
            wrapperClass="mb-4"
          />

          <PasswordInput
            label="New password"
            autoComplete="new-password"
            placeholder="Enter new password "
            wrapperClass="mb-4"
          />

          <PasswordInput
            label="Confirm Password"
            autoComplete="new-password"
            placeholder="Re-enter new password"
            wrapperClass="mb-5"
          />

          <Button type="submit" color="primary">
            Change password
          </Button>
        </div>
      </div>
    </form>
  );
}