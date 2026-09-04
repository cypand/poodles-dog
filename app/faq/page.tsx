'use client'

import { useState } from 'react'
import Header from '@/components/Header'

export default function FaqPage() {
  const [tab, setTab] = useState<'buyer' | 'breeder'>('buyer')

  return (
    <>
      <Header />
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-pd-black text-white rounded-md p-6 mb-4">
            <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
            <p className="text-sm text-white/60 mt-1">
              Everything you need to know before finding your Poodle, or joining poodles.dog as a breeder.
            </p>
          </div>

          <div className="bg-pd-gold/10 border border-pd-gold rounded-md p-4 mb-6">
            <h2 className="font-bold text-pd-black mb-1">Is poodles.dog free to use?</h2>
            <p className="text-sm text-pd-black/80">
              Yes. poodles.dog is completely free to use. There are no platform fees for buyers or breeders.
              Buyers can browse Poodles and connect with breeders, while breeders can create their presence and
              list their Poodles without paying poodles.dog a fee. Our goal is simple: to make it easier for
              Poodle lovers around the world to find the right Poodle and connect with breeders — without
              putting a paywall between them.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('buyer')}
              className={`text-sm font-bold px-4 py-2 rounded-md ${
                tab === 'buyer' ? 'bg-pd-black text-pd-gold' : 'border border-pd-black/15 bg-white text-pd-black'
              }`}
            >
              For Buyers
            </button>
            <button
              onClick={() => setTab('breeder')}
              className={`text-sm font-bold px-4 py-2 rounded-md ${
                tab === 'breeder' ? 'bg-pd-black text-pd-gold' : 'border border-pd-black/15 bg-white text-pd-black'
              }`}
            >
              For Breeders
            </button>
          </div>

          {tab === 'buyer' && (
            <div className="bg-white border border-pd-black/10 rounded-md p-6 space-y-8">
              <p className="text-sm text-pd-black/70">
                Whether you're looking for a Toy, Miniature, Medium or Standard Poodle — locally or
                internationally — we're here to help you make an informed and confident choice.
              </p>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Finding Your Poodle</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">How do I find a Poodle on poodles.dog?</h3>
                <p className="text-sm text-pd-black/80">
                  Browse available Poodles and use the search filters to narrow your results by characteristics
                  such as location, size, sex, color and other available criteria. When you find a Poodle you're
                  interested in, visit the listing to learn more and contact the breeder.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What Poodle sizes can I find?</h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  poodles.dog is dedicated exclusively to Poodles. Depending on availability, you may find:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Toy Poodles</li>
                  <li>Miniature Poodles</li>
                  <li>Medium Poodles</li>
                  <li>Standard Poodles</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  Size classifications can vary between kennel clubs and countries, so always discuss the
                  expected adult size with the breeder.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I find Poodles in other countries?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. poodles.dog is designed as an international platform, allowing buyers to discover Poodles
                  from breeders around the world. Always check your country's import requirements before
                  committing to an international purchase.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Are adult Poodles listed too?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Listings may include puppies, young dogs and adults, depending on what individual
                  breeders currently have available.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Breeders &amp; Safety</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What does "Verified Breeder" mean?</h3>
                <p className="text-sm text-pd-black/80">
                  A Verified Breeder has completed the verification requirements established by poodles.dog.
                  Verification is intended to provide buyers with additional information and confidence when
                  searching for a breeder. However, verification should never replace your own research and
                  communication with the breeder. Buyers should always review health documentation, ask
                  questions, request a written agreement and make their own informed decision before purchasing
                  a dog.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Does poodles.dog guarantee breeders?</h3>
                <p className="text-sm text-pd-black/80">
                  No. poodles.dog provides a platform that helps buyers discover and connect with Poodle
                  breeders. Breeder verification or presence on the platform does not constitute a guarantee of
                  a breeder, puppy, transaction, health outcome or future development of a dog. Buyers remain
                  responsible for conducting their own due diligence before entering into any agreement or
                  making payment.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  What should I ask a breeder before buying a puppy?
                </h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  A responsible breeder should be comfortable answering detailed questions. We recommend asking
                  about:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Health testing of both parents</li>
                  <li>Pedigree and registration</li>
                  <li>Temperament of the parents</li>
                  <li>Puppy socialization</li>
                  <li>Vaccinations and deworming</li>
                  <li>Microchip details</li>
                  <li>Purchase contract</li>
                  <li>Health guarantee, if offered</li>
                  <li>Expected adult size</li>
                  <li>Grooming and care requirements</li>
                  <li>Transport arrangements, if applicable</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">Don't be afraid to ask for supporting documentation.</p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">How can I protect myself from puppy scams?</h3>
                <p className="text-sm text-pd-black/80">
                  Never make a purchase based only on photographs or messages. Before sending money, verify the
                  breeder's identity, discuss the puppy directly with them, request relevant documentation and
                  carefully review the terms of the sale. Be cautious if someone pressures you to pay
                  immediately, refuses reasonable questions, provides inconsistent information or offers a
                  puppy at a price that appears unusually low.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I report a breeder or listing?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. If you believe a listing contains misleading information or you have concerns about a
                  breeder using poodles.dog, please report it to our team for review.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Health &amp; Documentation</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  What health tests should a Poodle's parents have?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Recommended health testing depends on the Poodle's size, country and breeding program.
                  Responsible breeders should be able to explain which health tests were performed on the
                  parents and provide evidence of the results. Health testing is different from a routine
                  veterinary examination or a DNA breed identification test.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Should I ask to see health test results?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Ask the breeder for documentation of relevant health tests performed on both parents.
                  Where possible, independently verify results through the organization or database that issued
                  or recorded them.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  What documents should I receive with my Poodle?
                </h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  This varies by breeder, country and whether the dog is sold with pedigree registration.
                  Documents may include:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Purchase agreement</li>
                  <li>Veterinary records</li>
                  <li>Vaccination record</li>
                  <li>Microchip information</li>
                  <li>Pedigree or registration documents</li>
                  <li>Health-testing information</li>
                  <li>Passport or travel documents, when applicable</li>
                  <li>Import/export documentation for international purchases</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  Ask the breeder exactly which documents will be provided before paying a deposit.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What is a pedigree?</h3>
                <p className="text-sm text-pd-black/80">
                  A pedigree documents a dog's ancestry across multiple generations. For registered Poodles,
                  pedigree information can help buyers understand the dog's lineage and identify the kennel
                  clubs or registries associated with its breeding history. A pedigree alone, however, does not
                  guarantee health, temperament or breeding quality.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Does a puppy need to be microchipped?</h3>
                <p className="text-sm text-pd-black/80">
                  Requirements vary by country. Microchipping is commonly required for identification,
                  registration and international travel. International buyers should verify the requirements
                  both in the breeder's country and in the destination country.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Price, Deposits &amp; Payments</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">How much does a Poodle cost?</h3>
                <p className="text-sm text-pd-black/80">
                  There is no single standard price. The price of a Poodle can vary significantly depending on
                  country, breeder, pedigree, size, age, health testing, breeding program and other factors.
                  Transport and import expenses may also substantially increase the total cost when purchasing
                  internationally.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Why do prices differ so much between breeders?</h3>
                <p className="text-sm text-pd-black/80">
                  Responsible breeding involves significant costs, including health testing, veterinary care,
                  quality nutrition, registration, puppy raising, socialization and care of the breeding dogs.
                  Pedigree, location, demand and the individual breeder's program can also influence price.
                  Price alone should never be used to determine breeder quality.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Is it normal to pay a deposit?</h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  Many breeders request a deposit to reserve a puppy. Before paying, make sure you understand in
                  writing:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>The deposit amount</li>
                  <li>Whether it is refundable</li>
                  <li>What happens if the breeder cannot provide the agreed puppy</li>
                  <li>What happens if you change your mind</li>
                  <li>When the remaining balance is due</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  Do not assume a deposit is refundable unless the breeder's terms explicitly say so.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Does poodles.dog handle payments?</h3>
                <p className="text-sm text-pd-black/80">
                  Unless a listing or poodles.dog service specifically states otherwise, arrangements between
                  the buyer and breeder should be treated as a direct transaction between those parties. Always
                  confirm who you are paying and what the payment is for before transferring money.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Should I have a purchase contract?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. We strongly recommend having a written agreement. The agreement should clearly identify
                  the buyer, seller and dog and describe the price, payment terms, health provisions,
                  registration status, delivery arrangements and any other important conditions of the sale.
                  Read the entire agreement before making the final payment.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">International Buyers &amp; Worldwide Transport</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I buy a Poodle from another country?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes, provided the breeder is willing to sell internationally and the dog meets the legal
                  import requirements of your country. International purchases require additional planning, so
                  discuss transport and documentation with the breeder early in the process.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can a Poodle be transported internationally?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Poodles are transported internationally using several methods depending on the route,
                  airline, age and size of the dog. Options may include accompanied travel, a professional pet
                  transporter, a flight nanny or approved animal cargo services. Availability and regulations
                  vary by country and airline.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Is flying safe for a puppy?</h3>
                <p className="text-sm text-pd-black/80">
                  Thousands of dogs travel by air, but every journey should be planned according to the
                  individual dog's age, health, route and applicable regulations. Discuss travel fitness with
                  the breeder and, where appropriate, a veterinarian and professional animal transport provider.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">How old must a puppy be before international travel?</h3>
                <p className="text-sm text-pd-black/80">
                  There is no universal minimum age. The permitted age depends on the destination country's
                  import regulations, vaccination requirements, rabies rules, airline policies and sometimes the
                  country of origin. In some cases, rabies vaccination and mandatory waiting periods mean a
                  puppy cannot legally enter a country until significantly later than the breeder's normal
                  collection age. Always verify the official import requirements for your destination.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  What documents might be required for international transport?
                </h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  Depending on the countries involved, requirements may include:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Microchip</li>
                  <li>Pet passport</li>
                  <li>Veterinary health certificate</li>
                  <li>Vaccination records</li>
                  <li>Rabies vaccination</li>
                  <li>Rabies antibody/titre test</li>
                  <li>Export documentation</li>
                  <li>Import permit</li>
                  <li>Customs documentation</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  Requirements can change, so buyers should confirm current rules with the relevant government
                  authorities before arranging travel.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Who pays for transportation and import costs?</h3>
                <p className="text-sm text-pd-black/80">
                  This is determined between the buyer and breeder. Before purchasing, ask for a clear breakdown
                  of the puppy price and any additional expenses, including transport, veterinary certificates,
                  airline charges, transport crates, customs, taxes, import permits and professional transport
                  services.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Choosing the Right Poodle</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Which Poodle size is right for me?</h3>
                <p className="text-sm text-pd-black/80">
                  The right size depends on your lifestyle, living environment, activity level and personal
                  preferences. Toy and Miniature Poodles are smaller and easier to transport, while Standard
                  Poodles are considerably larger and generally require more space, exercise and food.
                  Regardless of size, Poodles are intelligent, active dogs that require training, mental
                  stimulation and regular grooming.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Does color affect a Poodle's personality?</h3>
                <p className="text-sm text-pd-black/80">
                  Color should not be used as a reliable predictor of temperament. Temperament is influenced by
                  genetics, breeding selection, early development, socialization, training and environment.
                  Choose a breeder and puppy based on health and temperament first — color should be a
                  preference, not the primary selection criterion.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Should I choose a male or female Poodle?</h3>
                <p className="text-sm text-pd-black/80">
                  Both males and females can make excellent companions. Individual temperament, breeding,
                  socialization and compatibility with your household are generally more important than sex
                  alone. A good breeder can help recommend a puppy whose personality is appropriate for your
                  home.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Are Poodles good family dogs?</h3>
                <p className="text-sm text-pd-black/80">
                  Poodles can be excellent family companions. They are intelligent, trainable and typically
                  enjoy being involved in family life. As with any breed, children should be taught how to
                  interact respectfully with dogs, particularly very small Toy Poodles.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Are Poodles hypoallergenic?</h3>
                <p className="text-sm text-pd-black/80">
                  Poodles are low-shedding and are often considered more suitable for some people with allergies
                  than heavily shedding breeds. However, no dog is completely hypoallergenic. People with
                  significant allergies should spend time around Poodles before purchasing one and seek
                  appropriate medical advice if necessary.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">How much grooming does a Poodle need?</h3>
                <p className="text-sm text-pd-black/80">
                  Poodles require substantial lifelong grooming. Their continuously growing coat needs regular
                  brushing, bathing, drying and professional-quality clipping to prevent tangles and matting.
                  Most pet Poodles benefit from a complete grooming appointment approximately every 4–8 weeks,
                  depending on coat length, lifestyle and haircut.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Bringing Your Poodle Home</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What should I prepare before my puppy arrives?</h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  Prepare the essentials before bringing your puppy home, including:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Appropriate food</li>
                  <li>Food and water bowls</li>
                  <li>Collar or harness and lead</li>
                  <li>Safe sleeping area</li>
                  <li>Crate or puppy pen if you plan to use one</li>
                  <li>Grooming equipment</li>
                  <li>Suitable toys</li>
                  <li>Veterinary appointment</li>
                  <li>Puppy-proofed living areas</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  Ask the breeder what food and routine the puppy is already accustomed to so the transition can
                  be gradual.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  When should I take my new puppy to the veterinarian?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Arrange an initial veterinary examination shortly after receiving your puppy. Your
                  veterinarian can review the puppy's health, microchip, vaccination schedule, parasite
                  prevention, nutrition and any documentation supplied by the breeder.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">When should I start grooming my Poodle?</h3>
                <p className="text-sm text-pd-black/80">
                  Immediately. Poodles need to become comfortable with brushing, combing, bathing, drying, nail
                  care, handling and clipping from puppyhood. Early positive grooming experiences are
                  particularly important because grooming will be part of your Poodle's routine throughout its
                  entire life.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">When should training and socialization begin?</h3>
                <p className="text-sm text-pd-black/80">
                  From the beginning. Young puppies learn constantly. Positive training, safe socialization,
                  handling and exposure to everyday environments should begin early and progress appropriately
                  for the puppy's age and vaccination status.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">About poodles.dog</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Is poodles.dog a breeder?</h3>
                <p className="text-sm text-pd-black/80">
                  No. poodles.dog is a specialized platform dedicated to helping people discover Poodles and
                  connect with breeders. We do not breed every dog shown on the platform and listings belong to
                  their respective breeders or sellers.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Does poodles.dog sell the puppies directly?</h3>
                <p className="text-sm text-pd-black/80">
                  Poodles listed on the platform are generally offered by the breeder or seller identified in
                  the listing. Buyers should communicate directly with the relevant breeder regarding
                  availability, price, contracts, payment and collection or transport arrangements.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  Why use poodles.dog instead of a general puppy marketplace?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Because we're focused on one breed: the Poodle. Our goal is to make it easier to explore
                  Poodles across different sizes, colors, countries and breeding programs while providing
                  buyers with useful information about health, responsible breeding and international ownership.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can poodles.dog help me choose the right Poodle?</h3>
                <p className="text-sm text-pd-black/80">
                  Our platform and educational resources can help you understand your options and identify
                  important questions to ask. The final decision should be made between you and the breeder,
                  taking into account the individual dog's health, temperament and suitability for your
                  lifestyle.
                </p>
              </section>

              <section className="border-t border-pd-black/10 pt-4">
                <h2 className="text-lg font-bold text-pd-black mb-2">Still Have Questions?</h2>
                <p className="text-sm text-pd-black/80">
                  Finding the right Poodle is an important decision, and you shouldn't feel pressured to rush
                  it. Explore available Poodles, learn about breeders, ask questions and compare your options
                  before making a commitment.
                </p>
                <p className="text-sm text-pd-gold font-semibold mt-3">
                  Find your Poodle. Anywhere in the world.
                </p>
              </section>
            </div>
          )}

          {tab === 'breeder' && (
            <div className="bg-white border border-pd-black/10 rounded-md p-6 space-y-8">
              <p className="text-sm text-pd-black/70">
                Everything you need to know about joining poodles.dog, creating your breeder profile and
                connecting with Poodle buyers around the world.
              </p>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Joining poodles.dog</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Who can join poodles.dog as a breeder?</h3>
                <p className="text-sm text-pd-black/80">
                  poodles.dog is a specialized platform for Poodle breeders who want to showcase their dogs and
                  connect with people looking for Poodles. Breeders should provide accurate information about
                  themselves, their breeding program and the Poodles they list.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Is poodles.dog free for breeders?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. poodles.dog is completely free to use. There are no listing fees, subscription fees or
                  platform commissions for breeders. Our goal is to create a global Poodle community where
                  responsible breeders and people looking for Poodles can find each other easily — without a
                  paywall between them.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Do I need an account to list my Poodles?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. You need a breeder account to create and manage your breeder profile and listings. Your
                  account allows you to keep your information current, add available Poodles and manage your
                  presence on poodles.dog.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can breeders from any country join?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. poodles.dog is an international platform. Breeders from around the world can join,
                  subject to the platform's requirements and applicable local laws and regulations.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Breeder Profiles</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  What information should I include in my breeder profile?
                </h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  Your profile should help potential buyers understand who you are and how you breed. We
                  recommend including information about:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Your breeding program</li>
                  <li>Your location</li>
                  <li>Poodle sizes you breed</li>
                  <li>Your breeding goals</li>
                  <li>Health testing</li>
                  <li>Registrations or kennel club affiliations</li>
                  <li>Your experience with Poodles</li>
                  <li>Puppy raising and socialization</li>
                  <li>Transport or international delivery options</li>
                  <li>How buyers can contact you</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  A complete and transparent profile helps build buyer confidence.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  Can I add photos of my dogs and breeding program?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Yes. High-quality, authentic photos are strongly recommended. Photos help buyers understand
                  your dogs, your breeding program and the type of Poodles you produce. Whenever possible, use
                  your own recent photographs rather than generic or stock images.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I add my website or social media?</h3>
                <p className="text-sm text-pd-black/80">
                  Where supported by your breeder profile, you can provide additional information that helps
                  buyers learn more about your breeding program. Keep all information accurate and up to date.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Verification</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What is a Verified Breeder?</h3>
                <p className="text-sm text-pd-black/80">
                  A Verified Breeder is a breeder who has completed the verification requirements established by
                  poodles.dog. Verification helps buyers identify breeder profiles for which additional
                  information has been reviewed. Verification does not constitute a guarantee by poodles.dog
                  regarding any breeder, dog, transaction, health outcome or future development of a puppy.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Do I have to become verified?</h3>
                <p className="text-sm text-pd-black/80">
                  Verification requirements depend on the features and policies of poodles.dog. Even when
                  verification is not required to create a presence on the platform, completing verification
                  can provide buyers with additional confidence when viewing your profile.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  What information may be required for verification?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Depending on the verification process, breeders may be asked to provide information or
                  documentation relating to their identity, breeding program, dogs, registrations or health
                  testing. Any information submitted should be genuine, current and accurate.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can verification be removed?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. poodles.dog may review or remove verification if information becomes inaccurate,
                  requirements are no longer met or there are serious concerns regarding a breeder's use of the
                  platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Listing Your Poodles</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What Poodles can I list?</h3>
                <p className="text-sm text-pd-black/80">
                  Breeders can list Poodles that are genuinely available or relevant to their breeding program,
                  subject to the platform's listing rules. Listings should accurately describe the individual
                  dog being offered.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I list puppies before they are ready to leave?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes, provided the listing clearly communicates the puppy's age and availability. Buyers should
                  be informed of the earliest appropriate collection or travel date.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I list upcoming litters?</h3>
                <p className="text-sm text-pd-black/80">
                  Where this listing option is available, breeders may present planned or upcoming litters so
                  interested buyers can learn about them in advance. Information about future litters should be
                  clearly identified as planned or expected rather than guaranteed.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I list adult Poodles?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Adult Poodles may also be listed when appropriate. Clearly state the dog's age and reason
                  for availability and provide buyers with accurate information about health, temperament,
                  training and reproductive status where relevant.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What information should I include in a listing?</h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  Provide as much useful and accurate information as possible, including:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Date of birth</li>
                  <li>Sex</li>
                  <li>Color</li>
                  <li>Poodle size</li>
                  <li>Location</li>
                  <li>Parents</li>
                  <li>Pedigree or registration information</li>
                  <li>Relevant health information</li>
                  <li>Vaccinations</li>
                  <li>Microchip status</li>
                  <li>Temperament</li>
                  <li>Price, if applicable</li>
                  <li>Availability</li>
                  <li>Transport options</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  Good listings answer the buyer's most important questions before the first message is sent.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I edit my listing after publishing it?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Breeders should keep listings updated whenever information changes.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What should I do when a Poodle is no longer available?</h3>
                <p className="text-sm text-pd-black/80">
                  Update the listing as soon as possible. Keeping availability accurate prevents unnecessary
                  inquiries and creates a better experience for buyers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Photos &amp; Listing Quality</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What kind of photos should I upload?</h3>
                <p className="text-sm text-pd-black/80">
                  Use clear, recent photographs that accurately represent the Poodle being listed. Natural
                  light, a clean environment and photographs showing the dog's face and body generally work
                  best. Avoid excessive filters or editing that could misrepresent the dog's coat color, size or
                  appearance.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  Can I use AI-generated images for my Poodle listing?
                </h3>
                <p className="text-sm text-pd-black/80">
                  AI-generated images should not be used to represent an individual Poodle being offered for
                  sale. Buyers should be able to see authentic photographs of the actual dog.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I use photos with my kennel logo or watermark?</h3>
                <p className="text-sm text-pd-black/80">
                  Reasonable branding may be acceptable, provided it does not obscure the dog or make the
                  listing difficult to view.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Health &amp; Responsible Breeding</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Do I need to health test my breeding dogs?</h3>
                <p className="text-sm text-pd-black/80">
                  Breeders are responsible for following applicable breeding regulations and making their own
                  decisions regarding appropriate health testing. poodles.dog strongly encourages breeders to
                  follow recognized health-testing recommendations relevant to the Poodle's size, pedigree and
                  country.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I display health test results?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Providing clear information about health testing can help buyers make informed decisions
                  and understand your breeding program. Only claim tests that have actually been performed, and
                  accurately describe the results.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Should I provide buyers with health documents?</h3>
                <p className="text-sm text-pd-black/80">
                  Buyers should receive the documentation relevant to their individual puppy or dog and the
                  terms of the sale. Depending on the circumstances, this may include veterinary records,
                  vaccination records, microchip information, registration documents, pedigree information and
                  relevant health-testing documentation.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Buyers &amp; Inquiries</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">How do buyers contact me?</h3>
                <p className="text-sm text-pd-black/80">
                  Interested buyers can contact you using the communication options available through your
                  breeder profile or listing. Make sure your contact information is current and respond to
                  serious inquiries within a reasonable time.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I choose who I sell my puppies to?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. The breeder remains responsible for deciding whether a potential buyer is suitable for
                  one of their Poodles. poodles.dog helps breeders and buyers discover each other; it does not
                  require breeders to sell a dog to a particular person.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I ask buyers questions?</h3>
                <p className="text-sm text-pd-black/80 mb-2">
                  Absolutely. Responsible placement works both ways. You may want to ask about:
                </p>
                <ul className="list-disc pl-5 text-sm text-pd-black/80 space-y-1">
                  <li>Previous dog experience</li>
                  <li>Household and family</li>
                  <li>Other pets</li>
                  <li>Working hours and lifestyle</li>
                  <li>Living environment</li>
                  <li>Expectations regarding size and temperament</li>
                  <li>Grooming knowledge</li>
                  <li>Plans for training and socialization</li>
                  <li>Intended purpose for the dog</li>
                  <li>Location and transport requirements</li>
                </ul>
                <p className="text-sm text-pd-black/80 mt-2">
                  The goal is to determine whether the puppy and buyer are a suitable match.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What if I don't feel comfortable with a buyer?</h3>
                <p className="text-sm text-pd-black/80">
                  You are not required to proceed with a sale. If you believe a home is unsuitable for one of
                  your dogs, you can decline the inquiry.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Prices, Deposits &amp; Payments</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Does poodles.dog set the price of my Poodles?</h3>
                <p className="text-sm text-pd-black/80">
                  No. Breeders determine their own prices and terms. poodles.dog does not determine the value or
                  selling price of an individual dog.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  Does poodles.dog take a commission when I sell a Poodle?
                </h3>
                <p className="text-sm text-pd-black/80">
                  No. poodles.dog does not charge breeders a commission for selling a Poodle. The platform is
                  free to use.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I ask buyers for a deposit?</h3>
                <p className="text-sm text-pd-black/80">
                  Breeders may establish their own deposit and reservation policies, subject to applicable laws.
                  Your terms should be clearly communicated to buyers before accepting payment. We strongly
                  recommend putting deposit conditions in writing, including whether the deposit is refundable
                  and what happens if either party cannot proceed.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  Does poodles.dog handle payments between breeders and buyers?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Unless a specific poodles.dog service explicitly states otherwise, payments and financial
                  arrangements are made directly between the breeder and buyer. Both parties should clearly
                  understand the price, deposit terms, remaining balance and any additional costs before payment
                  is made.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Should I use a written puppy contract?</h3>
                <p className="text-sm text-pd-black/80">
                  We strongly recommend a written agreement. A clear contract can help both breeder and buyer
                  understand the terms of the transaction, including the identity of the dog, purchase price,
                  payment terms, registration, health provisions, collection or transport and any
                  breeder-specific conditions.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">International Buyers</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can international buyers contact me?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. One of the goals of poodles.dog is to help connect Poodle breeders and buyers across
                  borders. You decide whether you accept international inquiries and which countries you are
                  willing or able to work with.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Do I have to offer worldwide delivery?</h3>
                <p className="text-sm text-pd-black/80">
                  No. International transport is optional. You can decide whether you offer local collection
                  only, domestic transport, international transport or assistance with arranging
                  transportation. Make your available options clear in your profile and listings.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Who is responsible for international transport?</h3>
                <p className="text-sm text-pd-black/80">
                  The breeder and buyer should agree in advance who will arrange transportation and who will be
                  responsible for each cost. Depending on the journey, this can include veterinary certificates,
                  vaccinations, microchipping, travel crates, airline charges, professional pet transport,
                  customs, import permits and taxes.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Who is responsible for checking import requirements?</h3>
                <p className="text-sm text-pd-black/80">
                  International buyers and breeders should both verify the requirements relevant to the
                  transaction. Import and export regulations vary significantly between countries and can
                  change. Before arranging travel, confirm current requirements with the appropriate government
                  authorities, veterinarian, airline or professional pet transporter.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I work with a flight nanny or pet transport company?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Breeders may use professional transport services when appropriate. The breeder and buyer
                  should independently confirm the provider's credentials, services, costs and responsibilities
                  before making arrangements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Safety &amp; Trust</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  How can I make buyers feel confident about my breeding program?
                </h3>
                <p className="text-sm text-pd-black/80">
                  Transparency is one of the most effective ways to build trust. Complete your profile, use
                  authentic photographs, provide accurate health information, answer questions clearly and
                  provide documentation when appropriate. Never make claims that you cannot substantiate.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What happens if someone reports my profile or listing?</h3>
                <p className="text-sm text-pd-black/80">
                  poodles.dog may review reports concerning profiles, listings or activity on the platform. A
                  report does not automatically mean that a breeder has done something wrong. However,
                  poodles.dog may request additional information or take appropriate action when necessary to
                  protect the integrity of the platform.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can poodles.dog remove a listing or breeder account?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. poodles.dog may remove content or restrict accounts that violate platform rules, contain
                  misleading information, misuse the service or create legitimate safety or trust concerns.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Managing Your Breeder Presence</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I update my breeder profile?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes — and you should. Keep your location, contact details, breeding information, health
                  information and availability current. An accurate profile is more useful to buyers and
                  reflects your breeding program professionally.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What if I stop breeding?</h3>
                <p className="text-sm text-pd-black/80">
                  Update your profile or account status accordingly. If you no longer want your breeding program
                  displayed on poodles.dog, use the available account options or contact us for assistance.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Can I return and list another litter later?</h3>
                <p className="text-sm text-pd-black/80">
                  Yes. Your breeder profile can serve as your ongoing presence on poodles.dog, allowing you to
                  update your availability as your breeding program changes.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-pd-black mb-3">Why poodles.dog?</h2>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">Why should I list my Poodles on poodles.dog?</h3>
                <p className="text-sm text-pd-black/80">
                  poodles.dog is built specifically for the Poodle community rather than as a general pet
                  marketplace. It gives breeders a dedicated place to present their breeding program and Poodles
                  to people specifically searching for the breed — locally and internationally. And it's
                  completely free to use.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">
                  Does poodles.dog replace my own website or social media?
                </h3>
                <p className="text-sm text-pd-black/80">
                  No. Think of poodles.dog as another way for potential buyers to discover your breeding
                  program. Your own website, social media and existing breeder relationships can continue to
                  work alongside your poodles.dog profile.
                </p>

                <h3 className="font-semibold text-pd-black mt-4 mb-1">What does poodles.dog expect from breeders?</h3>
                <p className="text-sm text-pd-black/80">
                  We expect breeders to represent themselves and their dogs accurately, communicate responsibly
                  with buyers and keep their information current. Our aim is to build a useful international
                  platform based on transparency, responsible communication and a shared passion for Poodles.
                </p>
              </section>

              <section className="border-t border-pd-black/10 pt-4">
                <h2 className="text-lg font-bold text-pd-black mb-2">Ready to Join?</h2>
                <p className="text-sm text-pd-black/80">
                  Create your breeder profile, introduce your breeding program and showcase your Poodles to
                  people searching around the world.
                </p>
                <p className="text-sm text-pd-black/80 mt-2">Free for breeders. Free for buyers. No platform fees.</p>
                <p className="text-sm text-pd-gold font-semibold mt-3">
                  poodles.dog — Find your Poodle. Anywhere in the world.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
