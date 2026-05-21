const router = require('express').Router();
const Job = require('../models/Job');

const JOBS = [
  { atp: 'ATP-26-001', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'sent to customer 01/08/26', remarks: 'CADXY sent to raj on 01/08/2026', qh: '20' },
  { atp: 'ATP-26-002', owner: 'Lawrence', remarks: 'Schematic symbol sent to customer 010625', wh: '18' },
  { atp: 'ATP-26-003', owner: 'Lawrence', remarks: 'Schematic symbol sent to customer 010725', qh: '3', wh: '3' },
  { atp: 'ATP-26-004', owner: 'Chandran', feedback: 'sent to customer 01/09/26', remarks: 'gerber and pdf sent to customer on 01122026', qh: '24', wh: '24' },
  { atp: 'ATP-26-005', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'sent to customer 01/09/26', remarks: 'CADXY sent to raj on 01/09/2026', qh: '16' },
  { atp: 'ATP-26-006', owner: 'Manikandan', remarks: 'Updated package files sent to customer. 022026', wh: '5' },
  { atp: 'ATP-26-007', owner: 'Chandran', remarks: 'packages sent on 01242026' },
  { atp: 'ATP-26-008', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'sent to customer 01/14/26', remarks: 'packages sent on 03112026(need to quote for extra hours please check with chandran)', qh: '60', exp: '2026-01-23' },
  { atp: 'ATP-26-009', owner: 'Nandakumar', designers: ['Vignesh'], remarks: 'Completed layout with all the feedback, sent file to customer on 02/02/2025', qh: '24' },
  { atp: 'ATP-26-010', owner: 'Nandakumar', designers: ['Vignesh'], remarks: 'Final layout sent to customer on 02/27/2026', qh: '72' },
  { atp: 'ATP-26-011', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Package sent to customer on 02/12/2026', qh: '16' },
  { atp: 'ATP-26-012', owner: 'Chandran', feedback: 'sent to customer 01/21/26', remarks: 'completed layout,pdf and gerber(for review) sent on 01212026', qh: '8' },
  { atp: 'ATP-26-013', owner: 'Chandran', remarks: 'packages sent on 01272026', qh: '8' },
  { atp: 'ATP-26-014', owner: 'Chandran', remarks: 'packages sent on 01292026', qh: '8' },
  { atp: 'ATP-26-015', owner: 'Chandran', feedback: 'sent to customer 01/23/26', remarks: 'Updated gerber and pdf sent to customer on 01292026' },
  { atp: 'ATP-26-016', owner: 'Chandran', remarks: 'packages sent on 01282026' },
  { atp: 'ATP-26-017', owner: 'Punitha', designers: ['Tamilselvan'], feedback: 'sent to customer 02/04/26', remarks: 'Final files with drill file sent on 020426', qh: '16', wh: '16', exp: '2026-01-31' },
  { atp: 'ATP-26-018', owner: 'Chandran', remarks: 'updated Packages sent to customer on 04132026' },
  { atp: 'ATP-26-019', owner: 'Chandran', remarks: 'updated Packages sent to customer on 04132026' },
  { atp: 'ATP-26-020', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Final file to customer on 03/16/2026', qh: '48' },
  { atp: 'ATP-26-021', owner: 'Chandran', feedback: 'sent to customer 02/03/26', remarks: 'latest file and gerber sent on 02032026' },
  { atp: 'ATP-26-022', owner: 'Chandran', remarks: 'gerber sent to fab on 02162026' },
  { atp: 'ATP-26-023', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'sent the file to customer 02/04/26', remarks: 'Sent final file to RAJ on 02/04/2026', qh: '52' },
  { atp: 'ATP-26-024', owner: 'Manikandan', designers: ['Udhay'], remarks: 'Completed package files sent to Raj Thru Teams. 01/30/2026', qh: '4' },
  { atp: 'ATP-26-025', owner: 'Manikandan', designers: ['Udhay'], feedback: 'released 04/06/26', remarks: 'Package files sent to Raj. 04/06/2026', qh: '88' },
  { atp: 'ATP-26-026', owner: 'Manikandan', designers: ['TamilSelvan'], remarks: 'Package files sent on Feb 13th.', qh: '4' },
  { atp: 'ATP-26-027', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'feedback Completed file to customer on 03/09/2026', qh: '56' },
  { atp: 'ATP-26-028', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Sent final layout to customer on 03/28/2026', qh: '58' },
  { atp: 'ATP-26-029', owner: 'Manikandan', designers: ['Lawrence'], remarks: 'Layout sent to customer and Prelim gerber sent to raj for DFM checks on 021926', qh: '126' },
  { atp: 'ATP-26-030', owner: 'Nandakumar', designers: ['Vignesh'], feedback: 'sent to customer 04/06/26', remarks: 'Pin number confirmation sent to RAJ on 04/06/2026', qh: '16' },
  { atp: 'ATP-26-031', owner: 'Manikandan', designers: ['Chandran'], remarks: 'Package files sent on 03/19/2026', qh: '40' },
  { atp: 'ATP-26-032', owner: 'Nandakumar', designers: ['Sureshkumar'], remarks: 'combined netlist excel sent to customer on 03/24/2026', qh: '90' },
  { atp: 'ATP-26-033', owner: 'Nandakumar', designers: ['Vignesh'], remarks: 'Completed file sent to customer on 03/11/2026', qh: '48' },
  { atp: 'ATP-26-034', owner: 'Chandran', remarks: 'Updated layout sent on 03312026' },
  { atp: 'ATP-26-035', owner: 'Lawrence', feedback: 'released 04/13/26', remarks: 'Updated Package sent on 041326', qh: '252' },
  { atp: 'ATP-26-036', owner: 'Chandran', remarks: 'Updated file sent on 02282026' },
  { atp: 'ATP-26-037', owner: 'Chandran', feedback: 'gbr sent for dfm 03/05/36', remarks: 'updated layout sent on 03032026', qh: '12', wh: '12' },
  { atp: 'ATP-26-038', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'approved 02/25/26', remarks: 'Sent Final layout to RAJ on 02/20/2026', qh: '24' },
  { atp: 'ATP-26-039', owner: 'Manikandan', designers: ['Udhay'], feedback: 'sent to customer 04/07/26', remarks: 'Released on 05/10/2026', qh: '320' },
  { atp: 'ATP-26-040', owner: 'Nandakumar', designers: ['Manivannan'], feedback: 'sent to customer 03/24/26 will review the Assy doc', remarks: 'Package file sent thru teams to RAJ on 03/24/2026', qh: '10' },
  { atp: 'ATP-26-041', remarks: 'Placement and query sent to customer on  02/28/2026' },
  { atp: 'ATP-26-042', owner: 'Manikandan', feedback: 'sent to customer 02/20/26', remarks: 'Package files sent on feb 26th.', qh: '8' },
  { atp: 'ATP-26-043', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'sent to customer 02/25/26', remarks: 'Final layout sent to RAJ on 02/25/2026' },
  { atp: 'ATP-26-044', owner: 'Lawrence', remarks: 'Working on the 0201 DFM cleanups. 03/25/2026', qh: '40', exp: '2026-02-26' },
  { atp: 'ATP-26-045', owner: 'Chandran', remarks: 'packages sent on 03122026', wh: '10' },
  { atp: 'ATP-26-046', owner: 'Chandran', remarks: 'packages sent on 03122026', wh: '16' },
  { atp: 'ATP-26-047', owner: 'Chandran', remarks: 'packages sent on 03122026', wh: '16' },
  { atp: 'ATP-26-048', owner: 'Chandran', remarks: 'packages sent on 03112026' },
  { atp: 'ATP-26-049', owner: 'Nandakumar', designers: ['Vignesh'], remarks: 'Final file to customer on 03/19/2026', qh: '72' },
  { atp: 'ATP-26-050', owner: 'Chandran', remarks: 'packages sent on 03092026' },
  { atp: 'ATP-26-051', owner: 'Manikandan', remarks: 'Updated layout sent to customer. 030926', qh: '8' },
  { atp: 'ATP-26-052', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'released 04/09/26', remarks: 'Difference report shared to RAJ on 04/09/2026', qh: '44' },
  { atp: 'ATP-26-053', owner: 'Nandakumar', designers: ['Roshan'], feedback: 'sent to customer 03/09/26', remarks: 'Final file sent to RAJ on 03092026', qh: '48' },
  { atp: 'ATP-26-054', owner: 'Nandakumar', designers: ['Manivannan'], feedback: 'sent to customer 04/13/26', remarks: 'Final package share to Raj on 04/13/2026', qh: '180' },
  { atp: 'ATP-26-055', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'followed up 03/11/26', remarks: 'Query sent to RAj on 03/10/2026', qh: '2' },
  { atp: 'ATP-26-056', owner: 'Chandran', feedback: 'sent to customer on 03/26/26', remarks: 'Packages sent on 03252026', qh: '30', wh: '24' },
  { atp: 'ATP-26-057', owner: 'Nandakumar', designers: ['Roshan'], feedback: 'sent to customer 03/31/26', remarks: 'Feedback updated layout sent to RAJ on 03/31/2026 (check teams for layout)', qh: '24' },
  { atp: 'ATP-26-058', owner: 'Seetha', remarks: 'Working on combining the motherboard and DC board Altium (Cancelled)' },
  { atp: 'ATP-26-059', owner: 'Nandakumar', designers: ['Roshan'], feedback: 'sent to customer 03/23/26', remarks: 'Final layout sent to RAJ on 03/24/2026', qh: '40' },
  { atp: 'ATP-26-060', owner: 'Nandakumar', designers: ['Vignesh'], remarks: 'Final file to customer on 03/19/2026', qh: '12' },
  { atp: 'ATP-26-061', owner: 'Manikandan', remarks: 'Working Hours sent to Raj. 05/04/2026', wh: '8' },
  { atp: 'ATP-26-062', owner: 'Chandran', feedback: 'released 04/23/26', remarks: 'packages sent on 04232026' },
  { atp: 'ATP-26-063', owner: 'Nandakumar', designers: ['Vignesh'], remarks: 'Completed layout sent to customer on 04/16/2026', qh: '58' },
  { atp: 'ATP-26-064', owner: 'Chandran', feedback: 'sent to customer 04/21/26', remarks: 'packages  sent on 04212026' },
  { atp: 'ATP-26-065', owner: 'Chandran', feedback: 'released 04/22/26', remarks: 'packages  sent on 04222026' },
  { atp: 'ATP-26-066', owner: 'Chandran', remarks: 'Updated Packages sent to customer on 04162026' },
  { atp: 'ATP-26-067', owner: 'Chandran', remarks: 'UPD Packages sent to customer on 04082026' },
  { atp: 'ATP-26-068', owner: 'Lawrence', designers: ['Sambath'], feedback: 'sent to customer 04/08/26', remarks: 'layout file sent on 05/19/2026' },
  { atp: 'ATP-26-069', owner: 'Manikandan', designers: ['Sambath'], feedback: 'sent to customer 05/12/26', remarks: 'Updated layout and response document sent to Raj. 05/19/2026', qh: '12' },
  { atp: 'ATP-26-070', owner: 'Manikandan', feedback: 'sent to customer 04/23/26', remarks: 'Updated layout and Assembly drawing PDF sent to Raj. 050426', wh: '10' },
  { atp: 'ATP-26-071', owner: 'Manikandan', feedback: 'released 04/07/26', remarks: 'Package files sent to Raj. 04/09/2026', wh: '1' },
  { atp: 'ATP-26-072', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Placement sent to customer on 04/24/2026', qh: '56' },
  { atp: 'ATP-26-073', owner: 'Chandran', remarks: 'Updated Packages sent to customer on 04212026' },
  { atp: 'ATP-26-074', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Latest layout sent to customer on 05/13/2026', qh: '50' },
  { atp: 'ATP-26-075', owner: 'Chandran', remarks: 'packages sent on 05072026' },
  { atp: 'ATP-26-076', owner: 'Chandran', remarks: 'Step file sent on 04172026' },
  { atp: 'ATP-26-077', owner: 'Chandran', feedback: 'sent to customer 05/11/26', remarks: 'sent the latest file and length report on teams 052026' },
  { atp: 'ATP-26-078', owner: 'Manikandan', designers: ['Udhay', 'Tamil'], remarks: 'Waiting for the customer changes and feedbacks. 04/27/2026' },
  { atp: 'ATP-26-079', owner: 'Manikandan', designers: ['Udhay', 'Tamil'], feedback: 'sent to customer 05/14/26', remarks: 'Updated layout and review document sent to Raj thru Teams. 05/14/2026' },
  { atp: 'ATP-26-080', owner: 'Manikandan', remarks: 'Review document sent to Raj. 05/07/2026' },
  { atp: 'ATP-26-081', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Final layout sent to customer on 05/07/2026', qh: '26' },
  { atp: 'ATP-26-082', owner: 'Nandakumar', designers: ['Manivannan'], remarks: 'Final layout sent to customer on 05/07/2026', qh: '18' },
  { atp: 'ATP-26-083', owner: 'Manikandan', designers: ['Udhay', 'Tamil'], feedback: 'sent to customer 05/07/26', remarks: 'Updated layout and length report sent to customer. 051926' },
  { atp: 'ATP-26-084', owner: 'Lawrence', designers: ['Chandran'], feedback: 'sent 05/15/26', remarks: 'placement file sent on 052026', qh: '12' },
  { atp: 'ATP-26-085', owner: 'Lawrence', designers: ['Savitha'], feedback: 'sent 05/15/26', remarks: 'placement file sent on 052026', qh: '48' },
  { atp: 'ATP-26-086', owner: 'Lawrence', designers: ['Savitha'], feedback: 'sent 05/15/26', remarks: 'placement file sent on 052026', qh: '26' },
  { atp: 'ATP-26-087', owner: 'Chandran', designers: ['Sureshkumar'], remarks: 'packages sent to customer on 05152026', qh: '40' },
  { atp: 'ATP-26-088', owner: 'Nandakumar', designers: ['Sureshkumar'], feedback: 'sent 05/19/26', remarks: 'Updated Package and SCH sent to RAJ on 05/19/2026', qh: '30' },
  { atp: 'ATP-26-089', owner: 'Chandran', remarks: 'packages sent to customer on 05152026' },
  { atp: 'ATP-26-090' },
];

router.post('/', async (req, res, next) => {
  try {
    let updated = 0, notFound = 0;
    const results = [];
    for (const j of JOBS) {
      if (!j.owner && !j.designers && !j.remarks && !j.qh && !j.wh && !j.feedback) continue;
      const set = { updatedAt: new Date() };
      if (j.owner)     set.jobOwner    = j.owner;
      if (j.designers) set.designer    = j.designers;
      if (j.feedback)  set.rajFeedback = j.feedback;
      if (j.remarks)   set.remarks     = j.remarks;
      if (j.qh)        set.quotedHours = j.qh;
      if (j.wh)        set.workedHours = j.wh;
      if (j.exp)       set.expectedCompletion = new Date(j.exp);
      const r = await Job.updateOne({ atpNumber: j.atp }, { $set: set });
      if (r.matchedCount) { updated++; results.push({ atp: j.atp, ok: true }); }
      else { notFound++; results.push({ atp: j.atp, ok: false }); }
    }
    res.json({ ok: true, updated, notFound, results });
  } catch (err) { next(err); }
});

module.exports = router;
