import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CostGuardrailAlert from '@/components/molecules/observability/CostGuardrailAlert';
import { queryKeys } from '@/lib/react-query/query-keys';
import { ROUTES } from '@/routes';
import { observabilityService } from '@/services/observability.service';
import { cn } from '@/lib/utils';

type CostGuardrailBannerProps = {
  className?: string;
};

export default function CostGuardrailBanner({ className }: CostGuardrailBannerProps) {
  const statusQ = useQuery({
    queryKey: queryKeys.observability.costGuardrails(),
    queryFn: () => observabilityService.getCostGuardrails(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const banner = statusQ.data?.banner;
  if (!banner?.active || !banner.messages.length) {
    return null;
  }

  return (
    <CostGuardrailAlert
      className={cn(className)}
      messages={banner.messages}
      action={
        <Link
          to={`${ROUTES.admin.assistantObservability}?tab=cost`}
          className="inline-block font-medium underline underline-offset-2 hover:no-underline"
        >
          Manage cost guardrails
        </Link>
      }
    />
  );
}
