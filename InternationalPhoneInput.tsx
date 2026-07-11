import { Controller, Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface Props {
  name: string;
  control: Control<any>;
  label?: string;
  error?: string;
}

/**
 * Renders a country-flag + country-code phone input and always stores the
 * value in E.164 format (e.g. +2547XXXXXXXX), matching the backend schema.
 * Defaults to Kenya since that's KESHO's primary market.
 */
export function InternationalPhoneInput({ name, control, label = "Phone Number", error }: Props) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <PhoneInput
            id={name}
            international
            defaultCountry="KE"
            countries={["KE", "UG", "TZ", "RW", "SS"]}
            value={field.value}
            onChange={field.onChange}
            className={`kesho-phone-input rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-kesho-green-500 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          />
        )}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
