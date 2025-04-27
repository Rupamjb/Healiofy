import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const Appointments = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Appointments | Healiofy</title>
        <meta name="description" content="Book and manage your medical appointments" />
      </Helmet>
      
      <SubscriptionGuard serviceType="consultation" serviceName="Appointment Booking">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Appointments</h1>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <AppointmentsList />
          </div>
        </div>
      </SubscriptionGuard>
    </MainLayout>
  );
};

export default Appointments; 