
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

export interface HistoryEntry {
    id: string;
    type: 'deposit' | 'win' | 'loss' | 'bet'; // Game history can be win/loss, transaction can be deposit
    direction: 'credit' | 'debit';
    amount: string;
    description: string;
    createdAt: string;
    status?: string;
}

interface HistoryItemProps {
    item: HistoryEntry;
}

const formatTitle = (item: HistoryEntry): string => {
    switch(item.type) {
        case 'deposit':
            return "Funds Request";
        case 'win':
            return `Game Win: ${item.description || 'Unknown Game'}`;
        case 'loss':
            return `Game Loss: ${item.description || 'Unknown Game'}`;
        case 'bet':
             return `Game Bet: ${item.description || 'Unknown Game'}`;
        default:
            return item.description || "Transaction";
    }
}

export default function HistoryItem({ item }: HistoryItemProps) {
    const isCredit = item.direction === 'credit';
    const amount = parseFloat(item.amount);

    const getStatusClass = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'failed':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'hidden';
        }
    }

    return (
        <div className="flex justify-between items-center bg-background/30 p-2 rounded-md">
            <div>
                 <div className="flex items-center gap-2">
                    <p className="font-semibold">{formatTitle(item)}</p>
                    {item.status && (
                        <span className={cn(
                            "text-xs font-bold capitalize px-1.5 py-0.5 rounded-full border",
                            getStatusClass(item.status)
                        )}>
                            {item.status}
                        </span>
                    )}
                 </div>
                <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
            </div>
            <p className={cn(
                "font-bold",
                isCredit ? "text-green-400" : "text-red-500"
            )}>
                {isCredit ? '+' : '-'} {amount.toLocaleString()}
            </p>
        </div>
    );
}
