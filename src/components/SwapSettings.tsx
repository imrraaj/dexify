
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="mb-3 space-y-3 rounded-xl border border-white/10 bg-white/[0.045] p-3 text-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-black tracking-[-0.03em] text-white">Transaction Settings</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-7 w-7 rounded-lg text-white/45 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/55">Slippage Tolerance</span>
            <span className="text-sm font-bold text-emerald-300">{slippage}%</span>
          </div>
          
          <div className="flex gap-2 mb-2">
            {predefinedSlippages.map((value) => (
              <Button
                key={value}
                variant={slippage === value ? "default" : "outline"}
                onClick={() => setSlippage(value)}
                className={`flex-1 ${
                  slippage === value
                    ? 'bg-white text-[#080b10] hover:bg-emerald-50'
                    : 'bg-transparent border border-white/10 text-white/55 hover:bg-white/10 hover:text-white'
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
                className="w-full rounded-lg border-white/10 bg-black/20 pr-6 text-white focus-visible:ring-emerald-400"
                step="0.1"
                min="0"
                max="50"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/45">%</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/55">Transaction Deadline</span>
          </div>
          <div className="flex items-center">
            <div className="relative flex-1">
              <Input
                type="number"
                value={deadline}
                onChange={handleDeadlineChange}
                className="w-full rounded-lg border-white/10 bg-black/20 pr-16 text-white focus-visible:ring-emerald-400"
                min="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/45">minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapSettings;
