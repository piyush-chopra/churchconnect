from django.core.management.base import BaseCommand
from jobs.models import Job
DATA=[
('Worship & Creative Arts Director','Grace Community Church','Austin, TX','Worship & Music','Full-time','On-site',55000,72000,['Worship','Leadership','Media production'],'sage'),
('Youth Ministry Coordinator','Hope City Church','Denver, CO','Youth & Children','Full-time','On-site',42000,56000,['Youth ministry','Teaching','Event planning'],'sand'),
('Communications & Digital Lead','The Gathering','Remote, USA','Media & Creative','Full-time','Remote',58000,75000,['Communication','Media production','Technology'],'rose'),
('Associate Pastor','New Life Fellowship','Portland, OR','Pastoral','Full-time','On-site',60000,82000,['Theology','Pastoral care','Teaching','Leadership'],'lavender'),
('Community Outreach Coordinator','Riverstone Church','Charlotte, NC','Outreach','Part-time','Hybrid',28000,38000,['Community outreach','Volunteer management','Event planning'],'blue'),
('Church Operations Manager','Cornerstone Collective','Nashville, TN','Operations','Full-time','On-site',52000,68000,['Administration','Finance','Leadership'],'sand'),
('Children’s Ministry Director','Oak & Olive Church','San Diego, CA','Youth & Children','Full-time','On-site',48000,62000,['Children’s ministry','Teaching','Volunteer management'],'sage'),
('Weekend Production Specialist','Open Door Community','Chicago, IL','Media & Creative','Contract','Hybrid',30000,45000,['Media production','Technology','Worship'],'blue'),
('Pastoral Care Coordinator','Cedar Valley Church','Seattle, WA','Pastoral','Part-time','Hybrid',32000,46000,['Pastoral care','Communication','Community outreach'],'rose')]
class Command(BaseCommand):
    help='Create clearly marked fictional demonstration jobs, without user accounts.'
    def handle(self,*args,**kwargs):
        for title,church,location,category,kind,mode,low,high,skills,color in DATA:
            Job.objects.get_or_create(title=title,church=church,is_demo=True,defaults={'location':location,'category':category,'employment_type':kind,'work_mode':mode,'salary_min':low,'salary_max':high,'skills':skills,'color':color,'description':f'Bring your experience and care to a community that values meaningful work. As our {title.lower()}, you will help people connect, grow, and serve together.\n\nYou will collaborate with staff and volunteers, plan thoughtful experiences, and take ownership of the day-to-day work in your area. We value clear communication, a collaborative spirit, and a willingness to learn.\n\nThis is a fictional demonstration listing, created to help you explore ChurchConnect. No real employer will receive applications.','requirements':'Relevant experience in this area of ministry or transferable professional experience.\nStrong communication and collaboration skills.\nExperience supporting and developing volunteers.\nA thoughtful, service-oriented approach to working with people.'})
        self.stdout.write(self.style.SUCCESS('Demo jobs ready. All sample listings are marked as fictional.'))
