import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormCheckbox } from '@/components/atoms/FormCheckbox';
import { brandingGrowthLoopService } from '@/services/branding-growth-loop.service';
import { pbBodySecondaryClassName, pbNestedSectionTitleClassName } from '../personal-branding-ui';

const QUERY_KEY = ['preferences', 'branding-growth-loop'] as const;

export default function ContentPipelineGrowthSettingsCard() {
  const queryClient = useQueryClient();
  const configQ = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => brandingGrowthLoopService.getConfig(),
  });

  const saveMutation = useMutation({
    mutationFn: (draftLogbookOnPublish: boolean) =>
      brandingGrowthLoopService.setConfig({ draftLogbookOnPublish }),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });

  const checked = configQ.data?.draftLogbookOnPublish ?? false;

  return (
    <div className="space-y-2 rounded-lg border border-gray-200/80 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/30">
      <h3 className={pbNestedSectionTitleClassName}>Growth loop</h3>
      <p className={pbBodySecondaryClassName}>
        When content ships, optionally draft a Logbook reflection for today.
      </p>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <FormCheckbox
          id="draft-logbook-on-publish"
          checked={checked}
          disabled={configQ.isPending || saveMutation.isPending}
          onChange={(event) => saveMutation.mutate(event.target.checked)}
        />
        Draft Logbook reflection when content ships
      </label>
    </div>
  );
}
