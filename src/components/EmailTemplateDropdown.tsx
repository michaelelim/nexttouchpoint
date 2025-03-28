'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Candidate } from '@/types/candidate'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EmailTemplateDropdownProps {
  candidate: Candidate
}

const EMAIL_TEMPLATES = {
  checkIn: {
    subject: "Agilec - Checking In",
    body: (candidate: Candidate) => `Hi ${candidate.name},\n\nJust checking in on the job hunt on your side.\nEverything going well?\n\nLet's book another meeting.\nPlease book one here: Book time with Michael Lim\n\nPlease reach out should you have any questions.\nHave a good one,\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca\nNOTICE: This email message and any attachments are confidential and may contain privileged or proprietary information. Any unauthorized review, distribution, or use of this information is prohibited. If you are not the intended recipient, please contact us immediately by return email and delete or destroy this e-mail and any copies.\nCONNECT WITH US : Facebook   Twitter   LinkedIn   YouTube\nRead about our Going for Gold journey`
  },
  missedMeetingStranger: {
    subject: "Agilec - Missed Meeting",
    body: (candidate: Candidate) => `Hello ${candidate.name},\n\nUnfortunately, our scheduled meeting time has passed.\nPlease feel free to reach out when you are ready to book again.\n\nThanks and best of luck,\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca`
  },
  missedMeetingRegular: {
    subject: "Agilec - Missed Meeting",
    body: (candidate: Candidate) => `Hello ${candidate.name},\n\nUnfortunately, our scheduled meeting time has passed.\nPlease book our next meeting here: Book time with Michael Lim\n\nThanks and talk to you again soon,\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca`
  },
  betterJobsOntario: {
    subject: "Agilec - Better Jobs Ontario Information",
    body: (candidate: Candidate) => `Hello ${candidate.name},\n\nI hope everything is well.\nRegarding your interest in the Better Jobs Ontario program:\n\nAll interested candidates must sign up for a mandatory virtual information session.\nThe Better Jobs Ontario information session will cover general information about the program, including important terms, program suitability, eligibility, and Agilec's role in helping you complete your application.\nTo sign up for the Better Jobs Ontario information session, please use the link provided below to register, and select the session you would like to enroll in. I have also attached a PDF guide with visuals to help you through the registration process.\nBefore the information session, please have a copy of your Record of Employment and your most recent resume, as these documents are required for the Better Jobs Ontario application process.\n\nBetter Jobs Ontario Information Session: https://education.agilec.ca/resource/learn/course/external/view/classroom/762/better-jobs-ontario-customer-information-session\n\nIf you have any questions or concerns before the information session or need assistance creating an account, please reach out at your earliest convenience.\nWarm regards,\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca`
  },
  congratulations: {
    subject: "Agilec - Congratulations on Your New Job!",
    body: (candidate: Candidate) => `Congratulations ${candidate.name} about the job!\n\nThe ministry requests the following details for the job:\nJob Title:\nCompany Name:\nHourly Wage:\nHours per week:\nStart Date:\n\nWe will continue to assist you for the next 12 months on the job.\nShould there be any requirements for the job that we can help with (like clothes for example), please let me know, and I can put in a request to assist you.\nAlso, in the unfortunate event that you lose employment, we can continue with the job search immediately.\n\nFinally, the ministry requests the following pay stubs:\n1st pay stub, 1 month pay stub, 3 month, 6 month and 12 month pay stub\n\nShould you have any questions, please feel free to reach out.\nCongratulations again!\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca`
  },
  presto: {
    subject: "Agilec - Presto Pass for Next Month",
    body: (candidate: Candidate) => `Hi ${candidate.name},\n\nI hope you are doing well!\n\nAs the new month is approaching, I wanted to plan ahead and ask if you require a Presto pass for next month?\nThis allows me time to put in the request early and hopefully expedite the approval.\n\nAs always, please note that the funding is meant to be temporary until you've landed employment and gained some stability at the job.\n\nPlease let me know.\nThanks!\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca`
  },
  sickReschedule: {
    subject: "Agilec - Need to Reschedule Our Meeting",
    body: (candidate: Candidate) => `Good morning ${candidate.name},\n\nI'm sorry but unfortunately I have to reschedule our meeting as I'm home sick today with my daughter.\nPlease find the next best time here: Book time with Michael Lim\n\nThanks for understanding,\nMichael Lim\n905-426-1760 x5107`
  },
  transfer: {
    subject: "Agilec - Employment Consultant Transfer",
    body: (candidate: Candidate) => `Hello ${candidate.name},\n\nI hope that you are doing well.\n\nAs per my voicemail, we have a new employment consultant that has extensive previous experience as a job developer, and he will be taking over on helping you find work.\nHe will be reaching out to you to book your next meeting.\n\nHere's his contact information:\nNatiel McKenzie, Employment Consultant\nP: 905-426-1760 x5104\nE: nmckenzie@agilec.ca\n\nBest of luck on the job hunt!\n\nMichael Lim | Agilec\nBA, RTWDM\nEmployment Coach\n250 Bayly Street West, Unit 19, Ajax, Ontario  L1S 3V4\n905-426-1760 x5107\nwww.agilec.ca`
  }
}

export default function EmailTemplateDropdown({ candidate }: EmailTemplateDropdownProps) {
  const createMailtoLink = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateKey]
    const subject = encodeURIComponent(template.subject)
    const body = encodeURIComponent(template.body(candidate))
    return `mailto:${encodeURIComponent(candidate.email)}?subject=${subject}&body=${body}`
  }

  const handleEmailTemplate = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    window.location.href = createMailtoLink(templateKey)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Mail className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEmailTemplate('checkIn')}>
          Check-In
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('missedMeetingRegular')}>
          Missed Meeting (Regular)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('missedMeetingStranger')}>
          Missed Meeting (Stranger)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('betterJobsOntario')}>
          Better Jobs Ontario
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('congratulations')}>
          Congratulations (Job)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('presto')}>
          Presto Pass Request
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('sickReschedule')}>
          Sick Reschedule
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEmailTemplate('transfer')}>
          Transfer to Another Consultant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 