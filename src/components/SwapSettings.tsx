
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface SwapSettingsProps {
  slippage: number;
  setSlippage: (value: number) => void;
  deadline: number;
  setDeadline: (value: number) => void;
  onClose: () => void;
}

const SwapSettings: React.FC<SwapSettingsProps> = ({
  slippage,
  setSlippage,
  deadline,
  setDeadline,
  onClose
}) => {
  const predefinedSlippages = [0.1, 0.5, 1.0];
  
  const handleSlippageChange = (value: number[]) => {
    setSlippage(value[0]);
  };
  
  const handleCustomSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 50) {
      setSlippage(value);
    }
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDeadline(value);
    }
  };

  return (
    <div className="bg-emerald-900/10 rounded-lg p-4 mb-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-emerald-900 dark:text-base-text">Transaction Settings</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-6 w-6 text-base-muted hover:bg-emerald-800/10"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-emerald-800 dark:text-base-text">Slippage Tolerance</span>
            <span className="text-sm font-black text-emerald-900 dark:text-emerald-400">{slippage}%</span>
          </div>
          
          <div className="flex gap-2 mb-2">
            {predefinedSlippages.map((value) => (
              <Button
                key={value}
                variant={slippage === value ? "default" : "outline"}
                onClick={() => setSlippage(value)}
                className={`flex-1 ${
                  slippage === value
                    ? 'bg-emerald-800 hover:bg-emerald-800 dark:bg-emerald-500 dark:text-white'
                    : 'bg-transparent border border-emerald-700 text-base-muted  hover:bg-emerald-800/50 dark:hover:bg-emerald-800/50 hover:text-base-text'
                }`}
              >
                {value}%
              </Button>
            ))}
            <div className="relative flex-1">
              <Input
                type="number"
                value={slippage}
                onChange={handleCustomSlippageChange}
                className="w-full border-[1px] bg-emerald-100/10 border-zinc-700 text-emerald-900 dark:text-base-text pr-6"
                step="0.1"
                min="0"
                max="50"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-muted">%</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-emerald-900 dark:text-base-text">Transaction Deadline</span>
          </div>
          <div className="flex items-center">
            <div className="relative flex-1">
              <Input
                type="number"
                value={deadline}
                onChange={handleDeadlineChange}
                className="w-full bg-emerald-100/10 border border-zinc-700 text-emerald-900 dark:text-base-text pr-12"
                min="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-muted">minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapSettings;
