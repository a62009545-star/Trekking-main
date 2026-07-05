import { useState } from 'react';
import {
  ShieldCheck,
  CalendarX,
  RefreshCcw,
  PackageCheck,
  PackageX,
  CloudLightning,
  UserX,
  Route,
  AlertTriangle,
  ScrollText,
  ChevronDown,
} from 'lucide-react';

// Collapsible section wrapper — matches the accordion feel used on the FAQ page
const Section = ({ icon: Icon, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#0a1628] flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-yellow-400" />
          </span>
          <span className="font-semibold text-[#0a1628] text-sm sm:text-base">{title}</span>
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${
            open ? 'rotate-180 text-yellow-500' : ''
          }`}
        />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pl-[68px] text-sm text-gray-600 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a1628] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Please Read Carefully
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Terms &amp; Conditions</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            These terms apply to every booking made with Matrika Tours &amp; Travels. By confirming
            a trek with us, you agree to the policies below.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {/* Effective date / placeholder notice */}

        <Section icon={ShieldCheck} title="Booking &amp; Confirmation" defaultOpen>
          <p>
            Once you choose a trek and complete the booking form, we'll send a confirmation email
            with your trek details, itinerary, and payment summary.
          </p>
          <p>
            To lock in your spot, a non-refundable booking deposit of{' '}
            <strong>₹[amount]</strong> is required, which is adjusted against your total trek cost.
            The remaining balance is payable as per the schedule mentioned in your confirmation
            email.
          </p>
        </Section>

        <Section icon={CalendarX} title="Cancellation by the Traveler">
          <p>If you need to cancel a confirmed booking, refunds follow this schedule:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              More than <strong>30 days</strong> before the trek start date — <strong>70%</strong>{' '}
              refund of the total amount (excluding the booking deposit)
            </li>
            <li>
              Between <strong>15–30 days</strong> before the trek start date —{' '}
              <strong>50%</strong> refund (excluding the booking deposit)
            </li>
            <li>
              Less than <strong>15 days</strong> before the trek start date — no refund is
              available
            </li>
          </ul>
        </Section>

        <Section icon={RefreshCcw} title="Rescheduling Your Trek">
          <p>
            Need to change your dates instead of cancelling? You can reschedule up to{' '}
            <strong>20 days</strong> before the trek start date, provided the new date falls
            within the same trekking season. Rescheduling requests closer to the start date are
            handled case-by-case and are not guaranteed.
          </p>
        </Section>

        <Section icon={PackageCheck} title="What's Included">
          <ul className="list-disc pl-5 space-y-1">
            <li>Transportation as specified in your itinerary (pickup/drop points as agreed)</li>
            <li>Accommodation on a shared basis (homestay or hotel, depending on the trek)</li>
            <li>Meals as listed in your specific trek's itinerary</li>
            <li>An experienced guide/team leader assigned according to group size</li>
          </ul>
        </Section>

        <Section icon={PackageX} title="What's Not Included">
          <ul className="list-disc pl-5 space-y-1">
            <li>Meals taken during transit or outside the listed itinerary</li>
            <li>Personal camera/drone fees where applicable at trek locations</li>
            <li>Personal medical kit, backpack offloading charges, and porters (unless booked)</li>
            <li>Emergency evacuation costs</li>
            <li>Forest entry fees or permits not explicitly mentioned as included</li>
            <li>Any other personal expenses not listed above</li>
          </ul>
        </Section>

        <Section icon={CloudLightning} title="Cancellations or Changes by Matrika">
          <p>
            In rare situations beyond our control — severe weather, road closures, local
            disturbances, or government restrictions — a trek may need to be postponed, altered,
            or cancelled. In such cases, we'll offer an alternative batch or date wherever
            possible. Where a full trek cancellation on our part is unavoidable, we will discuss
            fair options with affected trekkers.
          </p>
        </Section>

        <Section icon={UserX} title="No-Show Policy">
          <p>
            If a trekker doesn't show up on the scheduled date/time without informing us in
            advance, no refund will be issued for that booking.
          </p>
        </Section>

        <Section icon={Route} title="Itinerary Changes During the Trek">
          <p>
            Trek schedules may be adjusted on the ground due to weather, trail conditions, or
            decisions made by your trek leader in the interest of group safety. These operational
            adjustments do not entitle trekkers to a refund or compensation.
          </p>
        </Section>

        <Section icon={ScrollText} title="Tour Guidelines">
          <p className="font-medium text-[#0a1628]">Please do:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Follow instructions from your trek leader or Matrika staff at all times</li>
            <li>Be on time for departures, meals, and scheduled activities</li>
            <li>Keep your personal belongings and documents secure</li>
            <li>Respect local communities, customs, and religious sites along the trail</li>
            <li>Inform your trek leader immediately of any health issue or emergency</li>
          </ul>
          <p className="font-medium text-[#0a1628]">Please don't:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Misbehave with staff, guides, drivers, or fellow trekkers</li>
            <li>Consume alcohol or other intoxicants in a way that disrupts the group</li>
            <li>Damage property belonging to hosts, vehicles, or the trek location</li>
            <li>Leave the group or go off-trail without informing your trek leader</li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="Liability &amp; Disclaimer">
          <p>
            Trekking involves inherent risk. Matrika Tours &amp; Travels is not liable for
            personal injury, illness, loss, delay, or damage arising from circumstances outside
            our reasonable control. Trekkers are responsible for their own belongings throughout
            the trip — we are not responsible for items lost or misplaced during the trek.
          </p>
          <p>
            The right of admission and removal from a trek in cases of misconduct rests with
            Matrika Tours &amp; Travels, and such decisions are final. Any disputes will be subject
            to the jurisdiction of the courts in <strong>Dehradun, Uttarakhand</strong>.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default TermsAndConditions;