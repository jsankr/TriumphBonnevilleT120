# Evidence and model validation — 2026-11-14

## Findings
- Previous generated concept screenshots are NOT screenshots of the application and cannot establish actual component quantities, positions or working features.
- 2018 rear suspension fiche: rear shock T2050479 quantity 2; M8 x 20 mounting bolt T3330244 quantity 4; washer T3550331 quantity 4. **M8 is a thread size, not a verified socket/hex drive size.**
- 2018 front fork fiche: LH and RH fork assemblies, with alternative part numbers split at VIN sequence 941382/941383. Display exactly two fitted fork legs, not four alternative variants at once.
- 3D model remains schematic and incomplete; physical geometry/fastener positions and explosion vectors are not OEM validated. Do not use for real teardown sequencing.
- Tool sizes for removal and installation and torques for unverified fasteners remain null. Not all fasteners are modelled or catalogued.
- The 2019 official Triumph owner handbook has a limited torque table, but it is not 2018 VIN-specific workshop confirmation. No torque values should be extrapolated from those entries.

## Source links
- 2018 rear suspension fiche: https://www.motorcyclespareparts.eu/en/triumph-parts/2018-bonneville-t120-motorcycles
- 2018 front fork fiche: https://www.motorcyclespareparts.eu/en/triumph-parts/2018-bonneville-t120-motorcycles
- Official 2019 owner handbook: https://api.triumphtechnicalinformation.com/handbooks/documents/6246e0045b05bf5ce5071ffc/pdf

## Remaining blockers before service-grade release
1. Licensed/verified dimensionally accurate 2018 T120 CAD or photographic exploded reference.
2. Correct 2018 workshop manual revision, India market and VIN applicability.
3. Fastener-level database with head drive, size, removal/installation procedure, tightening sequence, torque, thread treatment and provenance.
4. Verify any aftermarket Kineo wheels or TEC fork modifications separately; OEM specifications cannot automatically be reused.
5. Browser/WebGL and real-device interaction testing.

**Status: reference prototype, not service-grade.**
