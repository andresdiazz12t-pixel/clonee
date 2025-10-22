import React, { useMemo } from 'react';
import { Activity, BarChart3, CalendarCheck, TrendingUp } from 'lucide-react';
import { useReservations } from '../../context/ReservationContext';
import { useSpaces } from '../../context/SpaceContext';
import { Reservation } from '../../types';
import { parseLocalDate } from '../../utils/dateUtils';

type ReportsPanelProps = {
  onBack?: () => void;
};

const ReportsPanel: React.FC<ReportsPanelProps> = ({ onBack }) => {
  const { reservations } = useReservations();
  const { spaces } = useSpaces();

  const metrics = useMemo(() => {
    const MONTHS_TO_DISPLAY = 6;
    const HOURLY_RATE = 25000;

    const monthlyMap = new Map<
      string,
      {
        label: string;
        key: string;
        confirmed: number;
        cancelled: number;
        hours: number;
      }
    >();

    const formatter = new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      year: 'numeric'
    });

    const now = new Date();
    for (let i = MONTHS_TO_DISPLAY - 1; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      monthlyMap.set(key, {
        key,
        label: formatter.format(monthDate),
        confirmed: 0,
        cancelled: 0,
        hours: 0
      });
    }

    const monthlyEntries = (reservation: Reservation) => {
      const reservationDate = parseLocalDate(reservation.date);
      if (Number.isNaN(reservationDate.getTime())) {
        return null;
      }
      const key = `${reservationDate.getFullYear()}-${reservationDate.getMonth()}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,
          label: formatter.format(reservationDate),
          confirmed: 0,
          cancelled: 0,
          hours: 0
        });
      }
      return monthlyMap.get(key)!;
    };

    const parseDurationHours = (start: string, end: string) => {
      const [startHour, startMinute] = start?.split(':').map(Number) ?? [];
      const [endHour, endMinute] = end?.split(':').map(Number) ?? [];
      if (
        Number.isNaN(startHour) ||
        Number.isNaN(startMinute) ||
        Number.isNaN(endHour) ||
        Number.isNaN(endMinute)
      ) {
        return 0;
      }
      const startTotal = startHour + startMinute / 60;
      const endTotal = endHour + endMinute / 60;
      return Math.max(endTotal - startTotal, 0);
    };

    let cancelledCount = 0;
    let confirmedCount = 0;
    let totalHours = 0;

    const spaceUsageMap = new Map<
      string,
      {
        spaceId: string;
        name: string;
        total: number;
        hours: number;
      }
    >();

    reservations.forEach(reservation => {
      const monthlyBucket = monthlyEntries(reservation);
      const durationHours = parseDurationHours(reservation.startTime, reservation.endTime);

      const isCancelled = reservation.status === 'cancelled';
      if (isCancelled) {
        cancelledCount += 1;
      } else {
        confirmedCount += 1;
        totalHours += durationHours;
      }

      if (monthlyBucket) {
        if (isCancelled) {
          monthlyBucket.cancelled += 1;
        } else {
          monthlyBucket.confirmed += 1;
          monthlyBucket.hours += durationHours;
        }
      }

      if (!isCancelled) {
        const spaceInfo = spaces.find(space => space.id === reservation.spaceId);
        const usageEntry = spaceUsageMap.get(reservation.spaceId) ?? {
          spaceId: reservation.spaceId,
          name: spaceInfo?.name ?? reservation.spaceName ?? 'Espacio sin nombre',
          total: 0,
          hours: 0
        };
        usageEntry.total += 1;
        usageEntry.hours += durationHours;
        spaceUsageMap.set(reservation.spaceId, usageEntry);
      }
    });

    const monthlyUsageData = Array.from(monthlyMap.values())
      .filter(month => month.confirmed > 0 || month.cancelled > 0)
      .sort((a, b) => {
        const [aYear, aMonth] = a.key.split('-').map(Number);
        const [bYear, bMonth] = b.key.split('-').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });

    const totalReservations = reservations.length;
    const cancellationRate = totalReservations > 0 ? (cancelledCount / totalReservations) * 100 : 0;

    const topSpaces = Array.from(spaceUsageMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(entry => ({
        ...entry,
        share: confirmedCount > 0 ? (entry.total / confirmedCount) * 100 : 0
      }));

    const estimatedRevenue = totalHours * HOURLY_RATE;

    return {
      monthlyUsageData,
      cancellationSummary: {
        cancelledCount,
        confirmedCount,
        totalReservations,
        cancellationRate
      },
      topSpaces,
      revenueSummary: {
        totalHours,
        estimatedRevenue,
        hourlyRate: HOURLY_RATE
      }
    };
  }, [reservations, spaces]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
      }),
    []
  );

  const percentageFormatter = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-full">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes y Analíticas</h1>
            <p className="text-gray-600">Visualiza métricas clave para la toma de decisiones.</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Volver al Panel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Uso mensual</h2>
              <p className="text-sm text-gray-500">
                Evolución de reservas confirmadas y cancelaciones en los últimos meses.
              </p>
            </div>
            <CalendarCheck className="h-5 w-5 text-green-600" />
          </div>
          {metrics.monthlyUsageData.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay reservas suficientes para generar esta métrica.</p>
          ) : (
            <div className="space-y-4">
              {metrics.monthlyUsageData.map(month => {
                const total = month.confirmed + month.cancelled;
                const maxValue = Math.max(total, 1);
                return (
                  <div key={month.key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>{month.label}</span>
                      <span>{month.confirmed} confirmadas · {month.cancelled} canceladas</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(month.confirmed / maxValue) * 100}%` }}
                        />
                      </div>
                      {month.cancelled > 0 && (
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400"
                            style={{ width: `${(month.cancelled / maxValue) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Estado de reservas</h2>
              <p className="text-sm text-gray-500">Análisis de confirmaciones y cancelaciones acumuladas.</p>
            </div>
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          {metrics.cancellationSummary.totalReservations === 0 ? (
            <p className="text-sm text-gray-500">Aún no se registran reservas.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-semibold text-green-600">{metrics.cancellationSummary.confirmedCount}</p>
                <p className="text-sm text-gray-600">Confirmadas</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-semibold text-red-600">{metrics.cancellationSummary.cancelledCount}</p>
                <p className="text-sm text-gray-600">Canceladas</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-semibold text-blue-600">
                  {percentageFormatter(metrics.cancellationSummary.cancellationRate)}
                </p>
                <p className="text-sm text-gray-600">Tasa de cancelación</p>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Espacios con mayor ocupación</h2>
              <p className="text-sm text-gray-500">Ranking basado en reservas confirmadas.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          {metrics.topSpaces.length === 0 ? (
            <p className="text-sm text-gray-500">No hay reservas confirmadas para calcular la ocupación por espacio.</p>
          ) : (
            <ul className="space-y-3">
              {metrics.topSpaces.map(space => (
                <li key={space.spaceId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{space.name}</p>
                    <p className="text-sm text-gray-500">{space.total} reservas · {percentageFormatter(space.share)}</p>
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${Math.min(space.share, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Indicadores financieros estimados</h2>
              <p className="text-sm text-gray-500">
                Proyección basada en una tarifa promedio por hora y la duración de las reservas confirmadas.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          {metrics.revenueSummary.totalHours === 0 ? (
            <p className="text-sm text-gray-500">Necesitamos reservas confirmadas para estimar los ingresos.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-semibold text-emerald-600">
                  {currencyFormatter.format(metrics.revenueSummary.estimatedRevenue)}
                </p>
                <p className="text-sm text-gray-600">Ingresos proyectados</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-semibold text-emerald-600">
                  {metrics.revenueSummary.totalHours.toFixed(1)} h
                </p>
                <p className="text-sm text-gray-600">Horas reservadas</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-semibold text-emerald-600">
                  {currencyFormatter.format(metrics.revenueSummary.hourlyRate)}
                </p>
                <p className="text-sm text-gray-600">Tarifa promedio</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportsPanel;
