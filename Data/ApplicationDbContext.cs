using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WorldCities.Data.Models;

namespace WorldCities.Data
{
    public class ApplicationDbContext: DbContext
    {
        public ApplicationDbContext() : base() { 
        
        }

        public ApplicationDbContext(DbContextOptions options): base(options)
        {

        }

        public DbSet<City> Cities { get; set; }
        public DbSet<Country> Countries { get; set; }

        // If we want to use different approach to change default convention for how EFCore creates our DB, then instead of
        // Data Annotations used in Entity classes, we can override method below and explicitly state our rules
        //protected override void OnModelCreating(ModelBuilder modelBuilder) {
        //    base.OnModelCreating(modelBuilder);

        //    modelBuilder.Entity<City>().ToTable("Cities");
        //    modelBuilder.Entity<City>()
        //    .HasKey(x => x.Id);
        //    modelBuilder.Entity<City>()
        //    .Property(x => x.Id).IsRequired();

        //    modelBuilder.Entity<City>().ToTable("Countries");
        //    modelBuilder.Entity<Country>()
        //    .HasKey(x => x.Id);
        //    modelBuilder.Entity<Country>()
        //    .Property(x => x.Id).IsRequired();

        //    modelBuilder.Entity<City>()
        //    .HasOne(x => x.Country)
        //    .WithMany(y => y.Cities)
        //    .HasForeignKey(x => x.CountryId);
        //}

        //There is also additional way to change EFCore convention, using EntityTypeConfiguration classes
        //Very similar code to this one would be separated into different classes (one Entity = one class)
        //And modelBuilder will be separated into that classes depending for which Entity we are adding rules
    }
}
