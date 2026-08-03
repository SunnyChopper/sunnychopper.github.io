import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/atoms/Skeleton';
import {
  dashboardStatCardDescriptionClassName,
  dashboardStatCardDescriptionSkeletonClassName,
  dashboardStatCardIconTileClassName,
  dashboardStatCardInnerClassName,
  dashboardStatCardShellClassName,
  dashboardStatCardTextColumnClassName,
  dashboardStatCardTitleClassName,
  dashboardStatCardValueClassName,
  dashboardStatCardValueSkeletonClassName,
  dashboardStatCardValueSlotClassName,
} from './dashboard-stat-card-surfaces';

export interface DashboardStatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  link: string;
  description: string;
  /** When true, shows skeleton placeholders for value and description instead of misleading zeros */
  isLoading?: boolean;
}

export function DashboardStatCard({
  title,
  value,
  icon,
  link,
  description,
  isLoading = false,
}: DashboardStatCardProps) {
  return (
    <Link to={link} aria-busy={isLoading} className={dashboardStatCardShellClassName}>
      <div className={dashboardStatCardInnerClassName}>
        <div className={dashboardStatCardIconTileClassName}>{icon}</div>
        <div className={dashboardStatCardTextColumnClassName}>
          <div className={dashboardStatCardValueSlotClassName}>
            {isLoading ? (
              <Skeleton variant="rectangular" className={dashboardStatCardValueSkeletonClassName} />
            ) : (
              <h3 className={dashboardStatCardValueClassName}>{value}</h3>
            )}
          </div>
          <p className={dashboardStatCardTitleClassName}>{title}</p>
          {isLoading ? (
            <Skeleton variant="text" className={dashboardStatCardDescriptionSkeletonClassName} />
          ) : (
            <p className={dashboardStatCardDescriptionClassName}>{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default DashboardStatCard;
