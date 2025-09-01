
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

export interface HistoryEntry {
    id: string;
    type: 'deposit' | 'win' | 'loss' | 'bet'; // Game history can be win/loss, transaction can be deposit
    direction: 'credit' | 'debit';
    amount: string;
    description: string;
    createdAt: string;
}

interface HistoryItemProps {
    item: HistoryEntry;
}

const formatTitle = (item: HistoryEntry): string => {
    switch(item.type) {
        case 'deposit':
            return "Funds Added";
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

    return (
        <div className="flex justify-between items-center bg-background/30 p-2 rounded-md">
            <div>
                <p className="font-semibold">{formatTitle(item)}</p>
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
